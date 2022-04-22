
import {useEffect, useState} from "react";
import axios from "axios";
import {Container, Form} from "react-bootstrap"
import SpotifyWebApi from "spotify-web-api-node"
import {TrackSearchResult} from "./TrackSearchResult"
import {Player} from "./Player"
import 'bootstrap/dist/css/bootstrap.min.css';

// import {recommendedTracks} from "./Recommend"


require('dotenv').config()
const spotifyApi = new SpotifyWebApi({
  clientId: "ef95ae2b24034ef6b63c47e5317c0345",
})

function App() {
  const CLIENT_ID=process.env.CLIENT_ID
  const REDIRECT_URI=process.env.REDIRECT_URI
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken]=useState("")
  const [search, setSearch]=useState("")
  const [tracks, setTracks]=useState([])
  const [searchResults, setSearchResults] = useState([])
  const [playingTrack, setPlayingTrack] = useState()
  const [lyrics, setLyrics] = useState("")
  // console.log(searchResults)
  // const [trackIds, setTrackIds]=useState([])
  // const [features, setFeatures]=useState({})
  // https://example.com/#aaa という URL でサイトにアクセスした場合に、後ろの #aaa の部分を取得するには、 location.hash を参照します。 この値には、先頭の # が含まれるため、# を除いた文字列を取得したい場合は substring を合わせて使用します。
  function chooseTrack(track) {
    setPlayingTrack(track)
    setSearch("")
    setLyrics("")
  }
  useEffect(()=>{
    const hash=window.location.hash
    // localStorageからデータを取得する,取得したいデータのkeyを指定して取り出せる
    let token=window.localStorage.getItem("token")

    if (!token&&hash){
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      console.log(token)
      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }
    setToken(token)
  },[])
  useEffect(() => {
    if (!token) return
    spotifyApi.setAccessToken(token)
  }, [token])

  // useEffect(() => {
  //   if (!playingTrack) return

  //   axios
  //     .get("http://localhost:3001/lyrics", {
  //       params: {
  //         track: playingTrack.title,
  //         artist: playingTrack.artist,
  //       },
  //     })
  //     .then(res => {
  //       setLyrics(res.data.lyrics)
  //     })
  // }, [playingTrack])

  useEffect(() => {
    if (!search) return setSearchResults([])
    if (!token) return

    let cancel = false
    spotifyApi.searchTracks(search).then(res => {
      // console.log(res)
      if (cancel) return
      setSearchResults(
        res.body.tracks.items.map(track => {
          const smallestAlbumImage =  track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image
              return smallest
            },
            track.album.images[0]
          )
          
          async function audioFeature(){
            const data=await spotifyApi.getAudioFeaturesForTrack(track.id)
            const json=data.json();
            return json
            console.log(json)
          }
            audioFeature()
          //   then(function(resolve,reject){
          //   // console.log(data.body.danceability);
          //   let resolve1=resolve
          //   return resolve1
          // }, function(err) {
          //   console.log(err);
          // });
          // console.log(audioFeature)
          return {
            artist: track.artists[0].name,
            title: track.name,
            id: track.id,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
            feature: audioFeature
          }
        })
      )
    })

    return () => (cancel = true)
  }, [search, token])
  console.log(searchResults)



  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }
  const searchArtists=async (e)=>{
    e.preventDefault()
    const {data}=await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
    },
    params: {
        q: search,
        type:"track"
    }
    })
    console.log(data.tracks.items[0])
    setTracks(data.tracks.items)
    // setTrackIds(data.tracks.items.map((track)=>track.id))

  }

  // console.log(playingTrack)
  
  // const renderArtists=()=>{
  //   return tracks.map(track=>(
  //     <div key={track.id}>
  //       {/* {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>} */}
  //       {track.name}
  //       {track.id}
  //     </div>
  //   ))
  // }
  // const audio_features=()=>{
  //   return (
      
  //   )
  // }
  return (
    <div className="App">
      <header className="App-header">
      <h1>Spotify React</h1>
      {!token?
      <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
      :<button onClick={logout}>Logout</button>}
      
      {token?
      <form onSubmit={searchArtists}>
        {/* <input type="text" onChange={(e)=>setSearchKey(e.target.value)}/> */}
        <button type={"submit"} >Search</button>
      </form>
      :<h2>Please login</h2>}
      <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
        <input  placeholder="search" value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map(track => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
        </div>
        <div><Player token={token} trackUri={playingTrack?.uri}/></div>
      </Container>
      {/* {renderArtists()} */}
      {/* {searchAudioFeature()} */}
      </header>
    </div>
  );
}

export default App;
