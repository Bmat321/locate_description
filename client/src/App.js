import Map, { Marker, Popup } from "react-map-gl";
import { Room, Star } from "@material-ui/icons";
import "./app.css";
import Register from "./components/Register";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import Login from "./components/Login";

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentMarkerId, setCurrentMarkerId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [initialViewState, setInitialViewState] = useState({
    latitude: 40,
    longitude: 17,
    zoom: 3.5,
  });

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("/pins");
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentMarkerId(id);
    setInitialViewState({
      ...initialViewState,
      longitude: long,
      latitude: lat,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.long,
    };
    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogOut = () => {
    myStorage.removeItem("user");
    setCurrentUser(null);
  };

  const handleAddClick = (e) => {
    const { lat, lng: long } = e.lngLat;
    setNewPlace({ lat, long });
  };

  return (
    <div className="app">
      <Map
        initialViewState={{ ...initialViewState }}
        style={{ width: "100vw", height: "100vh" }}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onDblClick={handleAddClick}
      >
        {pins.map((p) => (
          <React.Fragment key={p._id}>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-initialViewState.zoom * 3.5}
              offsetTob={-initialViewState.zoom * 7}
              anchor="top"
            >
              <div>
                <Room
                  style={{
                    fontSize: initialViewState.zoom * 7,
                    color: p.username === currentUser ? "tomato" : "green",
                  }}
                  onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
                  className="room"
                />
              </div>
            </Marker>
            {p._id === currentMarkerId && (
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setCurrentMarkerId(null)}
              >
                <div className="card">
                  <label className="place">Place</label>
                  <h4>{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                </div>
              </Popup>
            )}
            {newPlace && (
              <Popup
                latitude={newPlace.lat}
                longitude={newPlace.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setNewPlace(null)}
              >
                <div>
                  <form onSubmit={handleSubmit}>
                    <label>Title</label>
                    <input
                      placeholder="Enter a title"
                      onChange={(e) => setTitle(e.target.value)}
                    ></input>
                    <label>Review</label>
                    <textarea
                      placeholder="Say someting about this place"
                      onChange={(e) => setDesc(e.target.value)}
                    ></textarea>
                    <label>Rating</label>
                    <select onChange={(e) => setRating(e.target.value)}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <button className="submitButton" type="submit">
                      Add Pin
                    </button>
                  </form>
                </div>
              </Popup>
            )}
          </React.Fragment>
        ))}

        {currentUser ? (
          <button className="button logout" onClick={handleLogOut}>
            Log Out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            myStorage={myStorage}
            setCurrentUser={setCurrentUser}
          />
        )}
      </Map>
    </div>
  );
}

export default App;
