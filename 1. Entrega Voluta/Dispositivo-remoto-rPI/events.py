import numpy as np
import time
from datetime import datetime
from datetime import timezone
import logging

class Event:
   def __init__(self, id, playlist, start_time, end_time, shuffle, repeat, random):
       self.id = id
       self.start = start_time
       self.end = end_time
       self.playlist = playlist
       self.shuffle = shuffle
       self.repeat = repeat
       self.random = random
   def duration(self):
       return self.end - self.start

# Debug: Print event
def printEvent(e):
    substring = ""
    substring = ("Event id: %d \n" % (e.id))
    substring = substring + (" playlist: %s \n" % (e.playlist))
    substring = substring + (" start time: %s \n" % (timeStr(e.start)))
    substring = substring + (" end time: %s \n" % (timeStr(e.end)))
    substring = substring + (" shuffle: %r \n" % (e.shuffle))
    substring = substring + (" repeat: %r \n" % (e.repeat))
    substring = substring + (" random: %r \n" % (e.random))
    substring = substring + (" duration: %d \n" % (e.duration()))
    logging.info(substring)
    return substring

def printEventLine(e):
    line = (str(e.id)  +',' + 
                   e.playlist  +',' +
                   str(e.start) + ',' +
                   str(e.end)+ ',' +
                   str(int(e.shuffle))+ ',' +
                   str(int(e.repeat))+ ',' +
                   str(int(e.random))+ "\n")
    return line

# Debug: Print events
def printEvents(events):
    logging.info('\n---- Events Start ----')
    for e in events:
        printEvent(e)
    logging.info('---- Events End ----\n')
    return True

# Debug: Timestamp to string
def timeStr(t):
    format_data = "%A %m/%d/%y %-I:%M:%S %p"
    tm = datetime.fromtimestamp(t)
    str = datetime.strftime(tm, format_data)
    #str = time.ctime(t)
    return str

# List events
def listEvents(events):
    list = ""
    for e in events:
        list = list + str(e.id) + ","
    end = len(list)-1
    return list[0:end]

# Event object from line text
def eventFromText(str):
    args = str.split(',')
    id = int(args[0])
    playlist = args[1]
    start_time = float(args[2])
    end_time = float(args[3])
    shuffle = bool(args[4])
    repeat = bool(args[5])
    random = bool(args[6])
    event = Event(id, playlist, start_time, end_time, shuffle, repeat, random)
    return event

# Load the events queue from file
def loadEvents(file):
    logging.info("Loading events...")
    events = np.array([])
    with open(file, encoding="ISO-8859-1") as f:         # Open the playlist file
        events_raw = f.readlines()
    f.closed
    if len(events_raw) != 0 :
        events_raw = np.char.strip(np.asarray(events_raw))
        for e in events_raw:
            args = e.split(',')
            id = int(args[0])
            playlist = args[1]
            start_time = float(args[2])
            end_time = float(args[3])
            shuffle = bool(args[4])
            repeat = bool(args[5])
            random = bool(args[6])
            event = Event(id, playlist, start_time, end_time, shuffle, repeat, random)
            events = np.append(events, event)        
    return events

# Save the events queue to a file
def saveEvents(events, file):
    with open(file, 'w')as file:
        for e in events:
            line = (str(e.id)  +',' + 
                   e.playlist  +',' +
                   str(e.start) + ',' +
                   str(e.end)+ ',' +
                   str(int(e.shuffle))+ ',' +
                   str(int(e.repeat))+ ',' +
                   str(int(e.random))+ "\n")
            file.write(line)
    file.closed
    return True

# Check events integrity
def checkEventsIntegrity(events):
    # Rule 1 - make sure all events are sorted by starting date
    logging.info("Sorting by start time...")
    s1 = list(events)
    s2 = sorted(s1, key=lambda event: event.start)
    events = np.array(s2)

   # Rule 2 - if an event has and end_time > the next start_time then adjust it by end_time = next_star_time - 2
    logging.info("Adjusting for consistent end times...")
    for i in range(1,len(events)):
        if (events[i-1].end >= events[i].start):
            events[i-1].end = events[i].start-2
            logging.info("Conflict was fixed between events " + str(events[i-1].id) + ' and ' + str(events[i].id))
    return events

# Add event to events
def addEvent(event, events):
    logging.info("Adding an event...")
    events = np.append(events,event)
    events = checkEventsIntegrity(events)
    return events

# Remove event from the events
def removeEvent(id, events):
    logging.info("Removing event id "+ str(id) + " ...")
    s1 = list(events)
    s2 = list(filter(lambda event: event.id != id, s1))
    events = np.array(s2)
    return events

##### MAIN ###########
# Parameters
#file = '/home/pi/iot-music/schedule.txt'

# Processing
#events = np.array([])
#events = loadEvents(file)                       # Load the events queue from file
#printEvents(events)
#printEvents(events)
#e = Event(13, '199340.m3u', int(time.time())+2000, int(time.time())+8000, False, False, False)

#e_text = ''
#e = eventFromText(e_text)
#printEvent(e)
#events = addEvent(e, events)

#e_text = '24,109666.m3u,1647402600,1647405200,1,1,1'
#e = eventFromText(e_text)
#printEvent(e)
#events = addEvent(e, events)


#printEvents(events)

#for e in events:

#   line = (str(e.id)  +',' + 
#           e.playlist  +',' +
#            str(e.start) + ',' +
#            str(e.end)+ ',' +
#            str(int(e.shuffle))+ ',' +
#            str(int(e.repeat))+ ',' +
#            str(int(e.random))+ "\n")
#    print("test:" + str(e.random))

#saveEvents(events, file)
#events = loadEvents(file)                       # Load the events queue from file
#printEvents(events)

#events = removeEvent(22, events)
#print(events[0])

#printEvents(events)
#print(listEvents(events))


##### JUNK ZONE ##########

#now = time.time()
#timestamp = time.ctime(now)
#current_local = time.localtime(now + 3650) 
#print("year =", a.year)
#print("month =", a.month)
#print("month =", a.day)
#print("hour =", a.hour)
#print("minute =", a.minute)
#print("timestamp =", a.timestamp())
#print(time.localtime(a.timestamp()))
#print(time.gmtime(a.timestamp()))
#print(time.time())
#print(time.localtime())
#print(time.gmtime())
#print(time.gmtime(0))
#events = np.array([])
# Event 1
#start = datetime(2021, 11, 7, 15, 00, 00)
#end = datetime(2021, 11, 7, 16, 00, 00)
#start_time = start.timestamp()
#end_time = end.timestamp()
#event1 = Event(1, start_time, end_time, '109654.m3u', True, True, False)
#events = np.append(events, event1)