import React from "react"

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
        {/* <div>{track.feature}</div> */}
      </div>
    </div>
  )
}