// pages/api/track/recommend.ts
// import axios from "axios";

// const getRecommendTracks = async (audioFeature, accessToken, type) => {
//     // レコメンド対象の曲と似たdanceabilityの曲が対象
//     const minDanceability = audioFeature.danceability * 0.8;
//     const maxDanceability = audioFeature.danceability * 1.2;

//     // レコメンドのタイプが'upper'なら元の曲からenergyの少し高い曲が、'downer'なら少し低い曲が対象
//     const minEnergy = type === 'upper' ? audioFeature.energy : audioFeature.energy * 0.8;
//     const maxEnergy = type === 'upper' ? audioFeature.energy * 1.2 : audioFeature.energy;

//     const recommendationsParams = new URLSearchParams();
//     recommendationsParams.set('seed_tracks', audioFeature.id);
//     // DJが曲同士をつなぎ合わせやすいように似たテンポの曲が対象
//     recommendationsParams.set('min_tempo', (audioFeature.tempo * 0.9).toString());
//     recommendationsParams.set('max_tempo', (audioFeature.tempo * 1.1).toString());
//     recommendationsParams.set('min_danceability', (minDanceability).toString());
//     recommendationsParams.set('max_danceability', (maxDanceability).toString());
//     recommendationsParams.set('min_energy', (minEnergy).toString());
//     recommendationsParams.set('max_energy', (maxEnergy).toString());


//     const recommendationsResponse = await axios.get(
//         `https://api.spotify.com/v1/recommendations?${recommendationsParams.toString()}`,
//         {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         }
//     );

//     // recommendations APIで取得した楽曲の特徴情報を取得
//     const featuresParams = new URLSearchParams();
//     featuresParams.append('ids', recommendationsResponse.data.tracks.map((item => item.id)).join(','));
//     const featuresResponse = await axios.get(
//         `https://api.spotify.com/v1/audio-features?${featuresParams.toString()}`,
//         {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         }
//     );
//     const audioFeatures = featuresResponse.data.audio_features;

//     return recommendationsResponse.data.tracks.map((item) => {
//         const targetItemFeature = audioFeatures.find((feature) => (feature.id === item.id));
//         return { ...item, audioFeatures: targetItemFeature };
//     });
// };
// export const recommendedTracks = async (req, res) => {
//         // このAPIへのリクエストからレコメンドする元の曲の特徴情報を受け取る
//         const audioFeature = req.body.track.audioFeatures;
//         // セッションからアクセストークンを取り出す
//         const accessToken = req.session.get('user').accessToken;

//         const [upperTracks, downerTracks] = await Promise.all(
//             [
//                 getRecommendTracks(audioFeature, accessToken, 'upper'),
//                 getRecommendTracks(audioFeature, accessToken, 'downer')
//             ]
//         );
//         res.status(200)
//         res.json({
//             upperTracks,
//             downerTracks
//         });
//     };
