import asyncio
import json
import os
from tkinter.constants import W
from dotenv import load_dotenv
from azure.iot.device.aio import IoTHubDeviceClient, ProvisioningDeviceClient
from azure.iot.device import MethodResponse
import subprocess
from gpiozero import *
import psutil
from readm3u import *
from events import *
import speedtest_cli as speedtest
import logging

# The schedule class
class Schedule:
    def __init__(self, program_file, mode, events):
        self.file = program_file
        self.mode = mode
        self.events = events
        self.state = False
        self.previous_state = False
    def pause(self):
        self.mode = False       
        return True
    def run(self):
        self.mode = True
        return True 
    def load(self):
        self.events = loadEvents(self.file)
        return True      
    def save(self):
        saveEvents(self.events, self.file)    
        return True
    def nextEvent(self):
        if len(self.events) > 0:
            return self.events[0].id
        else:
            return 0    

# The connection details from IoT Central for the device
load_dotenv()
id_scope = os.getenv("ID_SCOPE")
primary_key = os.getenv("PRIMARY_KEY")
device_id = "rpi-02"

# Gets telemetry from the device
# Telemetry needs to be sent as JSON data
async def get_telemetry() -> str:
    # Debug: Fixed values
    cpu = CPUTemperature()
    [temperature, humidity] = [cpu.temperature, 0.5]

    # Build a dictionary of data
    # The items in the dictionary need names that match the
    # telemetry values expected by IoT Central
    dict = {
        "Temperature" : temperature,  # The temperature value
        "Humidity" : humidity,        # The humidity value
    }

    # Convert the dictionary to JSON
    return json.dumps(dict)

# Command handling
async def sync_cmd_os(cmd, schedule, device_client):
    strOut = "Command not recognized"         # Default response

    # mpc commands group
    if cmd[0:3] == "mpc":
        # Create list with arguments for subprocess.run
        args=[]
        for i in cmd.split():
            args.append(i)
        
        if len(args) > 1:
            # Check if command is allowed
            commands = np.array([   "play",
                                    "next",
                                    "prev",
                                    "current",
                                    "queue",
                                    "pause",
                                    "stop",
                                    "seek",
                                    "status",
                                    "shuffle",
                                    "playlist",
                                    "volume",
                                    "repeat",
                                    "random",
                                    "stats",
                                    "clear",
                                    "load",
                                    "playlist",
                                    "lsplaylists"])
            allowed = commands[commands == args[1]]
            if len(allowed) != 0:
                try:
                    output = subprocess.run(args,capture_output=True)  # Run subprocess.run and save output object        
                except: # catch *all* exceptions
                    err2 = sys.exc_info()[0]
                    logging.error("[Sys] - " + str(err2))
                    strOut =  "[Sys] - " + str(err2)
                else:
                    strOut = output.stdout.decode("utf-8")
            else:
                strOut = "Mpc command not on the list"
        else:
            strOut = "Empty or invalid mpc command"

    # download commands group
    if cmd[0:8] == "download":
        args=[]
        for i in cmd.split():
            args.append(i)
        
        if len(args) > 1:
            url = args[1]
            music_dir = "/home/pi/Music"
            playlist_dir = "/var/lib/mpd/playlists"
            logging.info("A downloading task was launched")
            strOut = "A downloading task was launched"
            try:
                # result = await downloadPlaylist(url, playlist_dir, music_dir)
                task = asyncio.create_task(downloadPlaylist(url, playlist_dir, music_dir, device_client))
            except: # catch *all* exceptions
                err2 = sys.exc_info()[0]
                logging.error("[Sys] - " + str(err2))
                strOut =  "[Sys] - " + str(err2)
        else:
            strOut = "Download command empty"

    # program command group
    if cmd[0:7] == "program":
        program_file = schedule.file
        args=[]
        for i in cmd.split():
            args.append(i)
        
        if len(args) > 1:
            if args[1] == 'list':
                schedule.load()
                list = listEvents(schedule.events)
                logging.info('Event list ids: '+ list)
                strOut = list
                if len(args) > 2:
                    try:
                        strOut = 'Event Id: ' + args[2] + ' not found'
                        for e in schedule.events:
                            if e.id == int(args[2]):
                                strOut = printEventLine(e)
                    except:
                        err2 = sys.exc_info()[0]
                        strOut = "[Sys] - " + str(err2)
            
            if args[1] == 'add':
                schedule.load()
                if len(args) > 2:
                    try:
                        event = eventFromText(args[2])
                        printEvent(event)
                        schedule.events = addEvent(event, schedule.events)
                        schedule.save()
                    except:
                        err2 = sys.exc_info()[0]
                        strOut = "[Sys] - " + str(err2)
                    else:
                        strOut = "Event was added to the schedule"
                else:
                    strOut = "Add command empty"

            if args[1] == 'remove':
                schedule.load()
                if len(args) > 2:
                    try:
                        id = int(args[2])
                        logging.info("Removing event " + str(id))
                        schedule.events = removeEvent(id, schedule.events)
                        schedule.save()
                        strOut = "Event was removed from the schedule"
                    except:
                        err2 = sys.exc_info()[0]
                        strOut = "[Sys] - " + str(err2)
                else:
                    strOut = "Remove command empty"
            
            if args[1] == "start":
                schedule.run()
                schedule.load()
                printEvents(schedule.events)
                strOut = "Starting program mode"
            
            if args[1] == "stop":
                schedule.pause()
                strOut = "Stopping program mode"

        else:
            strOut = "Program command empty"     
    
    # play single song command
    if cmd[0:8] == "playsong":
        args=[]
        for i in cmd.split():
            args.append(i)
        
        if len(args)>1:
            if args[1] != "":
                file = args[1]
                end = file.find(".mp3")
                if end != -1:
                    strOut = "Working on loading the song"
                    commands = ["mpc clear", "mpc add "+"/home/pi/Music/" + file, "mpc play"] 
                    test = "mpc add " + "/home/pi/Music/" + file
                    strOut = ""
                    try:
                        for c in commands:
                            c_args = []
                            for i in c.split():
                                c_args.append(i)
                            output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
                            strOut = strOut + output.stdout.decode("utf-8") + "\n"
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)
                else:
                    strOut = "Not a valid .mp3 file"        
            else:
                strOut = "Not a valid .mp3 file"
        else:
            strOut = "Playsong command empty or invalid"

    # play direct playlist command
    if cmd[0:8] == "playlist":                    
        args=[]
        for i in cmd.split():
            args.append(i)
        
        if len(args)>1:
            if args[1] != "":
                file = args[1]
                end = file.find(".m3u")
                playlist_file = file[0:end]
                if end != -1:
                    strOut = "Working on loading the playlist " + playlist_file + " to the queue"
                    logging.info(strOut)
                    commands = ["mpc clear", "mpc load "+ playlist_file, "mpc play"] 
                    strOut = ""
                    try:
                        for c in commands:
                            c_args = []
                            for i in c.split():
                                c_args.append(i)
                            output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
                            strOut = strOut + output.stdout.decode("utf-8") + "\n"
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)
                else:
                    strOut = "Not a valid .m3u file"        
            else:
                strOut = "Not a valid .m3u file"
        else:
            strOut = "Playlist command empty or invalid"

    # Remove playlist
    if cmd[0:14] == "removeplaylist":                    
        args=[]
        for i in cmd.split():
            args.append(i)
        
        if len(args)>1:
            if args[1] != "":
                file = args[1]
                end = file.find(".m3u")
                if ((file.find("*") !=-1) or (file.find("%") !=-1) or (file.find("/")!=-1)):
                    end = -1
                if end != -1:
                    strOut = "Working on removing the playlist " + file
                    logging.info(strOut)
                    commands = ["rm /var/lib/mpd/playlists/"+ file] 
                    strOut = ""
                    try:
                        for c in commands:
                            c_args = []
                            for i in c.split():
                                c_args.append(i)
                            output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
                            strOut = strOut + output.stdout.decode("utf-8") + "\n"
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)
                else:
                    strOut = "Not a valid .m3u file"        
            else:
                strOut = "Not a valid .m3u file"
        else:
            strOut = "Playlist command empty or invalid"


    # Execute speedtest
    if cmd[0:9] == "speedtest":
        strOut = "Speedtest was launched"
        try:
            speedtest_process = asyncio.gather(speedTest(device_client))           #ToDo: Pass an object and update properties when completed
        except: # catch *all* exceptions
            err2 = sys.exc_info()[0]
            logging.error("[Sys] - " + str(err2))
            strOut =  "[Sys] - " + str(err2) 

    # update state
    logging.info("Updating properties")
    reported_properties = getStatus(schedule)
    await device_client.patch_twin_reported_properties(reported_properties)

    return strOut

# A better way to handle async commands
async def runCommand(cmd):
    proc = await asyncio.create_subprocess_shell(
            cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await proc.communicate()
    return proc.returncode, stdout, stderr

# Performing a speed test
async def speedTest(device_client):
    output = ""
    logging.info("Working on the speedtest")
    code, stdout, stderr = await runCommand("/home/pi/.local/bin/speedtest-cli --json")
    if stdout:
        output = stdout.decode()
        logging.info(f'Json Output: {output}')  

        # Update properties
        data = json.loads(output)
        reported_properties = {
                    "SpeedtestTimestamp": data['timestamp'],
                    "SpeedtestDownload": data['download'],
                    "SpeedtestUpload": data['upload'],
                    "SpeedtestPing": data['ping']
        }
        logging.info("Updating speedtest properties")
        await device_client.patch_twin_reported_properties(reported_properties)

    if stderr:
        output = stderr.decode()
        logging.error(f'Error message: {output}') 
    return output   

# Asynchronously wait for commands from IoT Central
async def command_listener(device_client, schedule):
    # Loop forever waiting for commands
    while True:
        # Wait for commands from IoT Central
        method_request = await device_client.receive_method_request()

        # The command was received        
        #print('\n'+ "######## COMMAND ########")
        logging.info(method_request.name + " - Command payload: " + str(method_request.payload))
        cmd = str(method_request.payload)
        output = await sync_cmd_os(cmd, schedule, device_client)
        logging.info('Response: ' + output)
        logging.info("Command was handled")

        # IoT Central expects a response from a command, saying if the call
        # was successful or not, so send a success response
        #payload = {"result": True}
        dict = {
                    "Ok": True,
                    "Command": cmd,
                    "Text": output,
        }

        # Build the response
        payload = json.dumps(dict)
        method_response = MethodResponse.create_from_method_request(
            method_request, 200, payload
        )

        # Send the response to IoT Central
        await device_client.send_method_response(method_response)

# Asynchronously execute the program schedule
async def program(device_client, schedule):
    # Loop forever tracking time and events
    while True:
        now = time.time()
        if schedule.mode == True:
            #print("Event state in progress: " + str(schedule.state))
            #print("Event previous state: " + str(schedule.previous_state))
            #print("Current time: " + timeStr(now))

            if len(schedule.events) != 0:

                # Next event on the schedule
                event = schedule.events[0]                
                #print("Event start: " + timeStr(event.start))
                #print("Event end: " + timeStr(event.end))                

                # Rule - Remove events from the past
                if event.end < now:
                    logging.info("Event Id " + str(event.id) + " has passed, removing it from the schedule")
                    schedule.events = removeEvent(event.id, schedule.events)
                    schedule.save()

                # Rule - Current event
                if event.start < now and event.end > now:
                    schedule.state = True
                    #print("Event in progress...")
                else:
                    schedule.state = False

                # Rule - Transition from idle to current 
                if schedule.state == True and schedule.previous_state == False:
                    #print("Trigger - Transition from idle to event in progress...")
                    logging.info("Event Id: " + str(event.id) + " has started ")
                    playlist = event.playlist[0:event.playlist.find(".m3u")]

                    if event.shuffle:
                        shuffle_flag = "shuffle"
                    else:
                        shuffle_flag = "status" 
                                            
                    if event.random:
                        random_flag = "on"
                    else:
                        random_flag = "off" 
                    
                    if event.repeat:
                        repeat_flag = "on"
                    else:
                        repeat_flag = "off" 


                    commands = ["mpc clear", "mpc load " + playlist, "mpc play", 
                                "mpc " + shuffle_flag, "mpc random " + random_flag, 
                                "mpc repeat " + repeat_flag, "mpc volume 90"] 
                    strOut = ""
                    try:
                        for c in commands:
                            c_args = []
                            for i in c.split():
                                c_args.append(i)
                            output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
                            strOut = strOut + output.stdout.decode("utf-8") + "\n"
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)
                    #print(strOut)

                    # update state
                    try:
                        logging.info("Updating properties")
                        reported_properties = getStatus(schedule)
                        await device_client.patch_twin_reported_properties(reported_properties)
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)

                # Rule - Transition from current to idle 
                if schedule.state == False and schedule.previous_state == True:
                    #print("Trigger - Transition from event in progress to idle...")
                    logging.info("Event Id: " + str(event.id) + " has ended ")

                    commands = ["mpc clear", "mpc repeat off", "mpc random off"] 
                    strOut = ""
                    try:
                        for c in commands:
                            c_args = []
                            for i in c.split():
                                c_args.append(i)
                            output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
                            strOut = strOut + output.stdout.decode("utf-8") + "\n"
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)
                    #print(strOut)
                    
                    # update state
                    try:
                        logging.info("Updating properties")
                        reported_properties = getStatus(schedule)
                        await device_client.patch_twin_reported_properties(reported_properties)
                    except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)


        await asyncio.sleep(1)           # Wait for time to pass to check another event
        schedule.previous_state = schedule.state

# Get mpc status variables
def getMpcStatus():
    status = [False, "None", "None", -1, False, False]

    # Get flag status and volumen
    c = "mpc status"
    c_args = []
    for i in c.split():
        c_args.append(i)
    output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
    strOut = output.stdout.decode("utf-8")
    
    # Get volume
    vol_start = strOut.find("volume:") + 7
    vol_end = strOut.rfind("%")   
    if vol_end != -1: 
        vol = int(strOut[vol_start:vol_end])
        status[3] = vol

    # Get status
    state_start = strOut.find("[") + 1
    state_end = strOut.rfind("]")   
    if state_end != -1: 
        state = strOut[state_start:state_end]
        if state == "playing":
            state = True
        else:
            state = False    
        status[0] = state   

    # Get repeat
    state_start = strOut.find("repeat:") + 7
    state_end = state_start + 4   
    if state_start != -1: 
        state = strOut[state_start:state_end].strip()
        if state == "on":
            state = True
        else:
            state = False    
        status[4] = state

    # Get random
    state_start = strOut.find("random:") + 7
    state_end = state_start + 4   
    if state_start != -1: 
        state = strOut[state_start:state_end].strip()
        if state == "on":
            state = True
        else:
            state = False    
        status[5] = state 

    # Get current song
    c = "mpc current -f %file%"
    c_args = []
    for i in c.split():
        c_args.append(i)
    output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
    strOut = output.stdout.decode("utf-8")
    if strOut != "":
        status[1] = getSongNameFromUrl(strOut)

    # Get next song on the queue
    c = "mpc queue -f %file%"
    c_args = []
    for i in c.split():
        c_args.append(i)
    output = subprocess.run(c_args,capture_output=True)  # Run subprocess.run and save output object        
    strOut = output.stdout.decode("utf-8")
    if strOut != "":
        status[2] = getSongNameFromUrl(strOut)

    return status

# Get status
def getStatus(schedule):
    status = getMpcStatus()
    properties = {
                    "ProgramMode": schedule.mode,
                    "ProgramState": schedule.state, 
                    "ProgramNumEvents": len(schedule.events),
                    "ProgramNextEvent": schedule.nextEvent(),
                    "PlayingSongState": status[0],
                    "PlayingSong": status[1],
                    "NextSong": status[2],
                    "Volume": status[3],
                    "Repeat": status[4],
                    "Random": status[5]                    
    #                "BootTime": psutil.boot_time(),
    #                "CPUTemperature": CPUTemperature().temperature,
    #                "LoadAverage": LoadAverage().value*100,
    #                "CPU": psutil.cpu_percent(interval=1),
    #                "DiskTotal": psutil.disk_usage('/').total/1024/1024/1024,
    #                "DiskUsedPercent": psutil.disk_usage('/').percent,
    #                "DiskFree": psutil.disk_usage('/').free/1024/1024/1024
                 }
    return properties

# The main function that runs the program in an async loop
async def main():
    print("Starting the countdown for background processes.....wait 120 sec")
    await asyncio.sleep(120)  # Wait 120 seconds to 
    print("Countdown finished.....starting the application")

    # Start the looging system
    logging.basicConfig(filename='/home/pi/iot-music/crp.log', 
                        level=logging.INFO,          # Log from INFO and up on the crp.log file                             
                        format='%(asctime)s | %(name)-12s | %(levelname)s | %(message)s')
    
    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)                  # Log from DEBUG up on the console
    formatter = logging.Formatter('%(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

    logger1 = logging.getLogger('azure.iot.device')
    logger1.setLevel(logging.WARNING)                 # Only log WARNING messages from Azure
  
    # Log the start of the application
    logging.info("Starting the application!")

    # Start the program process
    program_file = '/home/pi/iot-music/schedule.txt'
    events = loadEvents(program_file)
    schedule = Schedule(program_file, True, events)               # Create the schedule object
    logging.info("Program process initiated")
    #program_process = asyncio.gather(program(schedule))    

    # Connect to IoT Central and request the connection details for the device
    provisioning_device_client = ProvisioningDeviceClient.create_from_symmetric_key(
        provisioning_host="global.azure-devices-provisioning.net",
        registration_id=device_id,
        id_scope=id_scope,
        symmetric_key=primary_key)
    registration_result = await provisioning_device_client.register()

    # Build the connection string - this is used to connect to IoT Central
    conn_str="HostName=" + registration_result.registration_state.assigned_hub + \
                ";DeviceId=" + device_id + \
                ";SharedAccessKey=" + primary_key

    # The client object is used to interact with Azure IoT Central.
    device_client = IoTHubDeviceClient.create_from_connection_string(conn_str)

    # Connect the client.
    logging.info("Connecting to Azure IoT")
    await device_client.connect()
    logging.info("Connected to Azure IoT")

    # Start the command listener
    program_process = asyncio.gather(program(device_client, schedule)) # Debug
    listeners = asyncio.gather(command_listener(device_client, schedule))

    # async loop that sends the telemetry
    async def main_loop():
        while True:
            # Get the telemetry to send
            telemetry = await get_telemetry()
            #print("Telemetry:", telemetry)

            # Send the telemetry to IoT Central
            try:
                await device_client.send_message(telemetry)
            except: # catch *all* exceptions
                        err2 = sys.exc_info()[0]
                        logging.error("[Sys] - " + str(err2))
                        strOut =  "[Sys] - " + str(err2)
            
            # Wait for 60 seconds so telemetry is not sent too often
            await asyncio.sleep(60)

    # Run the async main loop forever
    await main_loop()

    # Cancel the command listener
    listeners.cancel()

    # Cancel the scheduler
    program_process.cancel()

    # Finally, disconnect
    await device_client.disconnect()

# Start the program running
asyncio.run(main())
