
import {useEffect, useState} from "react";
import axios from "axios";
import {Container, Form} from "react-bootstrap"
import SpotifyWebApi from "spotify-web-api-node"
import {TrackSearchResult} from "./TrackSearchResult"
import {Player} from "./Player"
import 'bootstrap/dist/css/bootstrap.min.css';

// import {recommendedTracks} from "./Recommend"

const spotifyApi = new SpotifyWebApi({
  clientId: "ef95ae2b24034ef6b63c47e5317c0345",
})

function App() {
  const CLIENT_ID=process.env.REACT_APP_CLIENT_ID
  const REDIRECT_URI=process.env.REACT_APP_REDIRECT_URI
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  console.log(CLIENT_ID)
  console.log(REDIRECT_URI)

  const [token, setToken]=useState("")
  const [search, setSearch]=useState("")
  const [tracks, setTracks]=useState([])
  const [searchResults, setSearchResults] = useState([])
  const [playingTrack, setPlayingTrack] = useState()
  const [lyrics, setLyrics] = useState("")
  
  function chooseTrack(track) {
    setPlayingTrack(track)
    setSearch("")
    setLyrics("")
  }
  useEffect(()=>{
    const hash=window.location.hash
    
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

          return {
            artist: track.artists[0].name,
            title: track.name,
            id: track.id,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
            preview_url: track.preview_url
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


  }



  return (
    <div className="App">
      <header className="App-header">
      <h1>Spotify React</h1>
      {!token?
      <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
      :<button onClick={logout}>Logout</button>}
      
      {token?
      <form onSubmit={searchArtists}>
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
      </Container>
      </header>
    </div>
  );
}

export default App;
