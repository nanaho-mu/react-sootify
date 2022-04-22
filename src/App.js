
import {useEffect, useState} from "react";
import axios from "axios";
import {Container, Form} from "react-bootstrap"
import SpotifyWebApi from "spotify-web-api-node"
import {TrackSearchResult} from "./TrackSearchResult"
import {Player} from "./Player"
import 'bootstrap/dist/css/bootstrap.min.css';





require("dotenv").config()
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
  const [featureResults, setFeatureResults]=useState([])
  const [audioF, setAudioF]=useState([])
  const [ids, setIds]=useState()
  const [audioFeature, setAudioFeature]=useState()
  const [similarTrack,setSimilarTrack]=useState([])
  const [audios, setAudios]=useState([])


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
  // console.log(searchResults)
  useEffect(()=>{
    setIds(searchResults.map(track=>{
      return track.id}
      ))
      const featuresResponse=async (e)=>{
        e.preventDefault()
        const featuresParams = new URLSearchParams();
        featuresParams.append('ids', searchResults.map((track => track.id)).join(','));
        const {data}=await axios.get(`https://api.spotify.com/v1/audio-features?${featuresParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`
        }
        })
        const audioFeatures = data.audio_features;
        // console.log(data)
        setAudios(audioFeatures)
        // setTrackIds(data.tracks.items.map((track)=>track.id))
    
      }
    
  },[searchResults])
  // console.log(ids)
  console.log(audios)
  
  // console.log(featuresResponse())




//   const featuresResponse =axios.get(
//     `https://api.spotify.com/v1/audio-features/${ids}`,
//     {
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': `Bearer ${token}`
//         }
//     }
// );
// const audioFeatures = featuresResponse.data.audio_features;

  // useEffect(() => {
  //   // if (!search) return setSearchResults([])
  //   if (!token) return

  //   let cancel = false
  //   // console.log(searchResults.id)
  //   setAudioFeature(ids.map((id)=>axios.spotifyApi.getAudioFeaturesForTrack(id).then(res => {
  //     // console.log(res.body.danceability)
  //     return res.body.danceability})))
  //     if (cancel) return
  //     console.log(res.body)
  //     setAudioF(
  //       res.body
  // )}))
    // console.log(audioF)
  //   audioF.then(res => {
  //     console.log(res.body)
  //     // return res.body
      // if (cancel) return
      // setFeatureResults(
      //       {danceability: res.body.danceability,
      //       energy: res.body.energy}
          
        // )
      // )
    
    
    // return () => (cancel = true)
  // }, [ids])
  // console.log(audioFeature)
  
  useEffect(() => {
    /* 似ている曲を取得 START */
    axios(`https://api.spotify.com/v1/recommendations?limit=10&market=US`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      params: {
        seed_tracks: tracks,
        target_danceability: tracks.danceability,
        target_energy: tracks.energy,
        
      },
    })
      .then((similarReaponse) => {
        setSimilarTrack(similarReaponse.data.tracks);
      })
      .catch((err) => {
        console.log("err:", err);
      });
    /* 似ている曲を取得 END */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
    // console.log(data.tracks.items[0])
    setTracks(data.tracks.items)
    // setTrackIds(data.tracks.items.map((track)=>track.id))

  }

  // console.log(playingTrack)
  const renderFeatures=()=>{
    return audios.map((audio,index)=>(
      <div key={index}>
        {audio.danceability}
      </div>
    ))
  }
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

      </Container>
      {renderFeatures()}
      {/* {searchAudioFeature()} */}
      </header>
    </div>
  );
}

export default App;
