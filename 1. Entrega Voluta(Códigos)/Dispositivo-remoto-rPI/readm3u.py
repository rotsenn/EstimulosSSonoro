import asyncio
import numpy as np
import os
import requests
import sys
import logging
import aiohttp        
import aiofiles
import time


# Get playlist name form an url
def getPlaylistNameFromUrl(url):
    substring = ""
    end = url.find(".m3u")
    if end != -1:
        start = url[0:end].rfind("/")
        if start != -1:
            substring = url[start+1:end] + ".m3u"
    return substring

# Get song name from a playlist line
def getSongNameFromUrl(url):
    substring = ""
    end = url.find(".mp3")
    if end != -1:
        start = url[0:end].rfind("/")
        if start != -1:
            substring = url[start+1:end] + ".mp3"
    return substring 

# Check if a song exits in the local directory
def songExists(s,directory):
    dir = os.listdir(directory)
    for i in dir:
        if i == s:
            return True
    return False

# Better way to download big files
async def asyncDownload(url, file, device_client):

    logging.info(f'Starting the download process for url: {url}')

    session = aiohttp.ClientSession()
    resp = await session.get(url)
    if resp.status == 200:
        file_size = resp.content_length
        chunk_size = int(file_size / 100)
        logging.info(f'File size: {file_size}')
        logging.info(f'Chunck size: {chunk_size}')
        f = await aiofiles.open(file, mode="wb")
        try:
            s = 0 ; n = -1 
            previous_size = s
            previous_time = time.time()
            start_time = previous_time
            async for chunk in resp.content.iter_chunked(chunk_size):
                s = s + len(chunk)
                sector = int(file_size / 5)             

                if  int(s/sector) > n:
                    now = time.time()
                    deltaTime = now - previous_time
                    deltaBytes = s - previous_size
                    byteRate = deltaBytes / deltaTime
                    timeToFinish = int((file_size - s)/byteRate)
                    elapsedTime = int(now - start_time)
                    porcentage = s/file_size * 100                
                    progressMB = s/(1024*1024)
                    sizeMB = file_size/(1024*1024)
                    logging.info( (f'Downloading file: {url} \nProgress: [{progressMB:0.1f}MB / {sizeMB:0.1f}MB] = {porcentage:0.1f}%  Time: {elapsedTime}s  Pending: {timeToFinish}s'))
                    logging.info(f'deltaTime: {deltaTime:0.2f}s, deltaBytes: {deltaBytes/(1024):0.2f} KB, byteRate: {byteRate/(1024):0.2f} KBytes/s')
                    
                    # Update properties
                    reported_properties = {
                                            "DownloadFile": file,
                                            "DownloadSize": file_size,
                                            "DownloadPorcentage": porcentage,
                                            "DownloadTime": timeToFinish
                                          }
                    logging.info("Updating download properties")
                    await device_client.patch_twin_reported_properties(reported_properties)
                    
                    # Update time and progress
                    n = n + 1
                    previous_time = now
                    previous_size = s

                await f.write(chunk)
        except: # catch *all* exceptions
            err2 = sys.exc_info()[0]
            logging.error("[Sys] - " + str(err2))
            strOut =  "[Sys] - " + str(err2)
         
        await f.close()
        logging.info(f'Download of {url} was complete')
    else:
        print(f'Download of {url} was aborted')
    await session.close()
    return True

# Download playlist from url
async def downloadPlaylist(url, playlist_dir, music_dir, device_client):
  
    # Get playlist name
    logging.info("== Playlist download process ==")
    playlist_name = getPlaylistNameFromUrl(url)
    if playlist_name !="":
        local_file = playlist_dir + "/" + playlist_name
        
        # Download playlist file
        try:
            data = requests.get(url)
            if data.status_code == 200:
                with open(local_file, 'wb')as file:
                    file.write(data.content)                # Save file data to local copy
                file.closed
                logging.info('Playlist file '+ playlist_name +' downloaded sucessfully.')
            elif data.status_code == 404:
                logging.info('File not found.')
            
            # Read playlist file
            with open(local_file, encoding="ISO-8859-1") as f:  # Open the playlist file
                songs_raw = f.readlines()
            f.closed

            # Remove empty lines and whitespaces
            songs = np.char.strip(np.asarray(songs_raw))  # Convert to array and strip whitespaces
            songs = songs[songs != ""]                    # Filter empty lines

            # Download songs loop
            num = 0
            with open(local_file, 'w')as pl_file:
                for song_url in songs:
                    if song_url[0] != "#":
                        num +=1

                        # Get song name
                        song_name = getSongNameFromUrl(song_url)
                        if song_name !="":
                            local_song_file = music_dir + "/" + song_name
                            
                            # Download song if not in local repository
                            if not songExists(song_name, music_dir):
                                logging.info(str(num)+ ". Downloading song:")
                                logging.info(" - Name: "+ song_name)
                                logging.info(" - Local file: "+ local_song_file)
                                logging.info(" - Remote url: " + song_url)                                
                                try:
                                    
                                    # ToDo: call the asyncDownload() coorutine with await
                                    await asyncDownload(song_url, local_song_file, device_client)

                                    #data = requests.get(song_url)
                                    #if data.status_code == 200:
                                    #    with open(local_song_file, 'wb')as file:
                                    #        file.write(data.content)                # Save file data to local copy
                                    #    file.closed
                                    #    logging.info(' - Download sucessfull.\n')
                                    #elif data.status_code == 404:
                                    #    logging.info(' - [CRP] - File not found.')
                                    


                                except requests.exceptions.MissingSchema as err:
                                    logging.info(str(num)+". [Sys] - " + str(err))
                            else:
                                logging.info(str(num)+ ". "+ song_name + " already on local repository")
                        else:
                            logging.info(str(num)+". [CRP] - Download error: mp3 file not found or invalid url")
                        
                        # Re-write playlist file with local directory    
                        line = music_dir +"/"+ song_name + "\n"
                        pl_file.write(line)
            pl_file.closed
        except requests.exceptions.MissingSchema as err1:
            logging.error("[Sys] - " + str(err1))
            return False
        except: # catch *all* exceptions
            err2 = sys.exc_info()[0]
            logging.error("[Sys] - " + str(err2))
            return False
    else:
        logging.error("[CRP] - InvalidFileError: Invalid playlist file or malformed url")
        return False
    return True

##### MAIN BODY #######
# Parameters
#url = 'http://dronemybox.com/crp/iotmusic/109657.m3u'
#url = 'http://68.183.142.245/api/v1/upload/playLists/618ae4b99649851b78a35a4f.m3u'
#music_dir = "/home/pi/Music"
#playlist_dir = "/var/lib/mpd/playlists"

# DEBUG
#url = "j/jalgo.m3ulare"
#downloadPlaylist(url, playlist_dir, music_dir)
