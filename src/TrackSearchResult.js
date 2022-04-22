import React from "react"
import ReactAudioPlayer from "react-audio-player"

export const TrackSearchResult =({ track, chooseTrack })=>{
  function handlePlay() {
    chooseTrack(track)
  }
  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={handlePlay}
    >
      <img src={track.albumUrl} alt="" style={{ height: "64px", width: "64px" }} />
      <div className="ml-3">
        <div>{track.title}</div>
        <div className="text-muted　text-black-50">{track.artist}</div>
        {track.preview_url
          ?<ReactAudioPlayer
          src={track.preview_url}
          controls
          />
          :<p>No preview music</p>
        }
        {/* <div>{track.feature}</div> */}
      </div>
    </div>
  )
}