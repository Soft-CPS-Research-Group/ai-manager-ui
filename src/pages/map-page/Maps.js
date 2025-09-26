import React, { useState, useEffect, useRef } from "react";
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Modal, Button, Row, Col, Form, Tab, ListGroup, Collapse } from 'react-bootstrap';
import { useSpring, animated, to } from "@react-spring/web";
import Papa from "papaparse";

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZW9saXZlaXJhMTE5MDc2OSIsImEiOiJjbTJtY3d4aW0wbGh0MnJxdGE2Ym1iazZkIn0.qNlgB4YscwyTcWXyCHfliA';

const Maps = () => {
  const [timelineScript, setTimelineScript] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [locationList, setLocationList] = useState([]);
  const [carLocationList, setCarLocationList] = useState([]);
  const [pvStatus, setPvStatus] = useState({});

  const [show, setShow] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState("");

  const fileInputRef = useRef(null);
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const [pendingSimulation, setPendingSimulation] = useState(null);

  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleConfirm = () => {
    if (pendingSimulation) {
      setSelectedSimulation(pendingSimulation);
    }
    handleClose();
  };

  // Files and parsed folder data
  const [simulationFolders, setSimulationFolders] = useState([]);
  const [parsedSimulations, setParsedSimulations] = useState({});
  const [fileMapByFolder, setFileMapByFolder] = useState({});

  // Only converts into script when data is ready
  useEffect(() => {
    if (selectedSimulation && parsedSimulations[selectedSimulation]) {
      convertToScript(parsedSimulations[selectedSimulation]);
    }
  }, [selectedSimulation, parsedSimulations]);

  // Reads the selected folder information and stores it
  const handleFolderUpload = async (event) => {
    const files = Array.from(event.target.files);
    const folderNames = new Set();

    // Step 1: Group files by folder name (Simulation_1, Simulation_2, etc.)
    const simulations = {};

    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const folderName = pathParts[1];
      const fileName = pathParts[2];

      folderNames.add(folderName);

      if (!simulations[folderName]) {
        simulations[folderName] = {};
      }

      simulations[folderName][fileName] = file;
    });

    setSimulationFolders([...folderNames].sort());
    setFileMapByFolder(simulations);
  };

  useEffect(() => {
    if (!selectedSimulation || Object.keys(fileMapByFolder).length === 0) return;

    setParsedSimulations((prevParsed) => {
      if (prevParsed[selectedSimulation]) return prevParsed;

      const updatedParsed = { ...prevParsed };
      const episodesBySim = {};
      let totalFiles = 0;
      let parsedFiles = 0;

      const fileMap = fileMapByFolder[selectedSimulation];
      if (!fileMap) return prevParsed;

      updatedParsed[selectedSimulation] = {};
      episodesBySim[selectedSimulation] = new Set();

      const dataFiles = Object.entries(fileMap).filter(
        ([fileName]) => !/kpi(s)?/i.test(fileName)
      );

      totalFiles += dataFiles.length;

      dataFiles.forEach(([fileName, file]) => {
        const cleanedFileName = fileName
          .replace("exported_data_", "")
          .replace(/\.[^/.]+$/, "");

        const episodeMatch = cleanedFileName.match(/_?(ep\d+)/i);
        if (episodeMatch) {
          episodesBySim[selectedSimulation].add(episodeMatch[1]);
        }

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            updatedParsed[selectedSimulation][cleanedFileName] = results.data;
            parsedFiles++;

            if (parsedFiles === totalFiles) {
              const episodesObj = {};
              episodesObj[selectedSimulation] = Array.from(
                episodesBySim[selectedSimulation]
              ).sort();

              // setAvailableEpisodes(episodesObj);
              setParsedSimulations(updatedParsed);
            }
          },
          error: (error) => {
            console.error(`❌ Error parsing ${file.name}:`, error);
            parsedFiles++;
            if (parsedFiles === totalFiles) {
              setParsedSimulations(updatedParsed);
            }
          }
        });
      });

      return prevParsed;
    });
  }, [selectedSimulation, fileMapByFolder]);

  // Map and animation settings
  const [viewport, setViewport] = useState({
    latitude: 39.3999,
    longitude: -8.2245,
    zoom: 6,
  });

  const [energyEvents, setEnergyEvents] = useState({});
  const [carEvents, setCarEvents] = useState({});
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const timers = useRef([]); // store timeouts so we can clear later if needed

  // Arrows for energy event
  const EnergyArrow = ({ event }) => {
    const isProduce = event.action === "produce";

    const style = useSpring({
      from: { opacity: 0, y: isProduce ? 20 : -40, scale: 0.5 },
      to: [
        { opacity: 1, y: -20, scale: 1.2 },
        { opacity: 0, y: isProduce ? -40 : 0, scale: 1.2 },
      ],
      config: { duration: 1000 }
    });

    return (
      <animated.div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          transform: "translateY(-50%)",
          fontSize: "1.5rem",
          color: isProduce ? "green" : "red",
          ...style,
        }}
      >
        <i className={`fa ${isProduce ? "fa-arrow-up" : "fa-arrow-down"}`} />
      </animated.div>
    );
  };

  // Cars for car events
  const CarIcon = ({ event }) => {
    const [style, api] = useSpring(() => ({
      from: { opacity: 0, x: 0 },
      to: { opacity: 1, x: 0 },
      config: { duration: 1700 }
    }));

    useEffect(() => {
      if (!event) return;

      if (event.action === "leave") {
        api.start({
          from: { opacity: 1, x: 0 },
          to: { opacity: 0, x: 30 }, // slide right
        });
      } else if (event.action === "arrive") {
        api.start({
          from: { opacity: 0, x: 30 },
          to: { opacity: 1, x: 0 }, // slide in from left
        });
      }
    }, [event, api]);

    return (
      <animated.div style={{ ...style, fontSize: "1.3rem" }}>
        <i className={`fa fa-car-side ${event.action === "arrive" ? "fa-flip-horizontal" : ""}`} />
      </animated.div>
    );
  };

  //Temporary helper funcion
  const randomPortugalLocation = () => {
    // Rough bounding box for mainland Portugal
    const latMin = 36.95, latMax = 42.15;
    const lonMin = -9.5, lonMax = -6.0;

    const latitude = (Math.random() * (latMax - latMin) + latMin).toFixed(6);
    const longitude = (Math.random() * (lonMax - lonMin) + lonMin).toFixed(6);

    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  };

  // Convert the simulation data to a script
  const convertToScript = (sim) => {
    let completeScript = [];
    let locations = [];
    let carLocations = [];
    let c = 1;

    console.log(sim)

    Object.entries(sim).forEach(([key, value]) => {
      let commandList = [];

      // Get only the buildings
      if (key.includes("building") && !key.includes("charger")) {
        value.forEach((v, index) => {
          let command = { time: (index * 3), timestamp: v['timestamp'], action: "consume", to: key, pvProduction: parseFloat(v["Energy Production from PV-kWh"]) || 0 };
          if (v['Net Electricity Consumption-kWh'] < 0) {
            command.action = "produce";
          }
          commandList.push(command);
        })

        completeScript.push({
          element: key,
          commands: commandList
        });

        // Check if building has a car (charger)
        const chargerKey = Object.keys(sim).find(
          (k) =>
            k.startsWith(key.replace("_ep0", "")) &&
            k.includes("charger")
        );

        // Create random location for this element
        const { latitude, longitude } = randomPortugalLocation();
        locations.push({
          id: "building" + (c++),
          name: key,
          latitude: latitude, longitude: longitude,
          icon: "fa fa-home",
          description: `Random location for ${key}`
        });

        if (chargerKey) {
          let carCommands = [];

          sim[chargerKey].forEach((v, index) => {
            let command = {
              time: index * 3,
              timestamp: v["timestamp"],
              action: null,
              to: chargerKey,
              evName: v["EV Name"],
            };

            if (parseFloat(v["EV Charger State"]) === 1.0) {
              command.action = "home";   // parked at home
            } else if (parseFloat(v["EV Charger State"]) === 2.0) {
              command.action = "arrive";  // coming back
            } else {
              command.action = "leave"; // leaving home
            }

            if (command.action) {
              carCommands.push(command);
            }
          });

          completeScript.push({
            element: chargerKey,
            type: "car",
            commands: carCommands,
          });

          carLocations.push({
            id: "car_" + locations[locations.length - 1].id,
            name: chargerKey,
            latitude: latitude, longitude: longitude,
            icon: "fa fa-car",
            description: `Car location for ${key}`
          })
        }
      }
    });

    setTimelineScript(completeScript);
    setLocationList(locations);
    setCarLocationList(carLocations);
    console.log("Scripts:", completeScript);
    console.log("Buildings:", locations);
    console.log("Cars:", carLocations);
  }

  const runScript = (element, commands) => {
    if (!timers.current[element]) {
      timers.current[element] = [];
    }

    // Clear old timers for this element
    timers.current[element].forEach((t) => clearTimeout(t));
    timers.current[element] = [];

    let index = timelineScript[0].commands.length - commands.length;
    commands.forEach((step) => {
      const timer = setTimeout(() => {
        setCurrentStep(index);
        index++;

        if (step.action === "consume" || step.action === "produce") {
          const source = locationList.find((l) => l.name === step.from);
          setEnergyEvents(prev => ({ ...prev, [element]: { house: source, action: step.action } }));

          setTimeout(() => {
            setEnergyEvents(prev => {
              const copy = { ...prev };
              delete copy[element];
              return copy;
            });
          }, 1700 / playbackSpeed);
        }

        if (step.action === "leave" || step.action === "arrive" || step.action === "home") {
          setCarEvents(prev => ({ ...prev, [element]: { car: step.evName, action: step.action } }));

          setTimeout(() => {
            setCarEvents(prev => {
              const copy = { ...prev };
              delete copy[element];
              return copy;
            });
          }, 1700 / playbackSpeed);
        }

        // Check if solar panel is active
        if (step.pvProduction !== undefined) {
          setPvStatus(prev => ({
            ...prev,
            [element]: (step.pvProduction * -1) > 0,
          }));
        }
      }, (step.time * 1000) / playbackSpeed);

      timers.current[element].push(timer);
    });

    // Schedule stop when this element’s script finishes
    const lastStep = commands[commands.length - 1];
    const lastTime = (lastStep.time * 1000) / playbackSpeed;
    const maxAnimDuration = 2000 / playbackSpeed;

    const stopTimer = setTimeout(() => {
      // Check if all elements are done before stopping global playback
      const allDone = Object.values(timers.current).every(arr => arr.length === 0);
      if (allDone) {
        setPlaying(false);
      }
    }, lastTime + maxAnimDuration);

    timers.current[element].push(stopTimer);
  };

  const stopScript = () => {
    // Cancel all scheduled timeouts for all elements
    Object.values(timers.current).forEach(timerArr => {
      timerArr.forEach(t => clearTimeout(t));
    });
    timers.current = {};

    // Reset step and animation states
    setCurrentStep(0);
    setEnergyEvents({});
    setCarEvents({});
    setPlaying(false);
  };

  // Used to keep track of the current time of the simulation timeline running
  const [playheadTime, setPlayheadTime] = useState(0);

  // Update playhead whenever step changes
  useEffect(() => {
    if (timelineScript.length > 0) {
      setPlayheadTime(timelineScript[0].commands[currentStep].time);
    }
  }, [currentStep]);

  // Speed changes
  useEffect(() => {
    if (playing && timelineScript.length > 0) {
      timelineScript.forEach(scriptObj => {
        const remaining = scriptObj.commands.filter(c => c.time > playheadTime);
        if (remaining.length > 0) {
          // normalize relative to playheadTime
          const normalized = remaining.map(c => ({
            ...c,
            time: c.time - playheadTime
          }));

          runScript(scriptObj.element, normalized);
        }
      });
    }
  }, [playbackSpeed]);

  // Start script when play is pressed
  useEffect(() => {
    if (playing && timelineScript.length > 0) {
      timelineScript.forEach(scriptObj => {
        runScript(scriptObj.element, scriptObj.commands);
      });
    }
  }, [playing]);

  return (
    <>
      <Row>
        <Col>
          {/* Hidden File Input */}
          <input
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleFolderUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
            aria-label="Upload simulation data"
          />

          <Button
            className="d-flex align-items-center"
            variant="secondary"
            onClick={handleUploadClick}
          >
            <i className="fa fa-upload mr-2"></i>
            Upload Simulations
          </Button>
        </Col>

        {simulationFolders.length > 0 && (
          <Col className="d-flex flex-row-reverse">
            <Button variant="primary" onClick={handleOpen}>Select Simulations</Button>
          </Col>
        )}
      </Row>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="md">
        <Modal.Header className="py-0 d-flex align-items-center">
          <Modal.Title>Select Simulation</Modal.Title>
          <Button
            variant="danger"
            type="button" size="md"
            onClick={handleClose}
          >
            <i className="fa fa-times"></i>
          </Button>
        </Modal.Header>

        <Modal.Body className="pt-0">
          <Row>
            {simulationFolders.map((sim) => (
              <Col lg="4" sm="6" key={sim}>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      type="radio"
                      name="simulationSelection"
                      checked={pendingSimulation === sim}
                      onChange={() => setPendingSimulation(sim)}
                    />
                    {sim}
                  </Form.Check.Label>
                </Form.Check>
              </Col>
            ))}
          </Row>
        </Modal.Body>

        <div className="d-flex flex-row-reverse" style={{ padding: "25px 25px 15px" }}>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!pendingSimulation}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      {/* Load tabs only if there are selected simulations */}
      {selectedSimulation && (
        <>
          <h3>{selectedSimulation} Timeline</h3>
          {/* <Row>
            <Col>
              {availableEpisodes[selectedSimulation] && availableEpisodes[selectedSimulation].length > 1 && (
                <Form.Group controlId={`episodeSelect-${selectedSimulation}`} className="mb-2 w-25">
                  <Form.Label>Select Episode</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedEpisode[selectedSimulation] || availableEpisodes[selectedSimulation][0]}
                    onChange={(e) => handleEpisodeChange(selectedSimulation, e.target.value)}
                  >
                    {availableEpisodes[selectedSimulation].map((ep) => (
                      <option key={ep} value={ep}>
                        {`Episode ${ep.replace(/ep/i, "")}`}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              )}
            </Col>
          </Row> */}
          <div className="my-2">
            {playing &&
              <>
                <div className="d-flex justify-content-between">
                  <div className="d-flex w-50">
                    <Button className="btn-danger mr-2" onClick={stopScript}>
                      <span><i className="fa fa-stop mr-2"></i>Stop</span>
                    </Button>

                    {/* Progress Bar */}
                    <div className="d-flex flex-column w-50">
                      {timelineScript[0]?.commands[currentStep] && (
                        <span>
                          {timelineScript[0].commands[currentStep].timestamp.replace("T", " ")} •{" "}
                          {Math.round((currentStep * 100) / timelineScript[0].commands.length)}%
                        </span>
                      )}

                      <div
                        className="progress"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          // Calculate current position on the progress bar
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const width = rect.width;
                          const clickPercent = clickX / width;

                          // Dynamically changes timeline to start on the clicked position
                          const newStep = Math.floor(clickPercent * timelineScript[0].commands.length);
                          setCurrentStep(newStep);

                          if (playing && timelineScript.length > 0) {
                            timelineScript.forEach(scriptObj => {
                              const filteredCommands = scriptObj.commands.slice(newStep);
                              const baseTime = filteredCommands[0].time;
                              const normalizedCommands = filteredCommands.map(c => ({
                                ...c,
                                time: c.time - baseTime
                              }));
                              runScript(scriptObj.element, normalizedCommands);
                            });
                          }
                        }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${(currentStep * 100) / timelineScript[0].commands.length}%`,
                          }}
                          aria-valuenow={(currentStep * 100) / timelineScript[0].commands.length}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>

                  </div>

                  <div className="btn-group d-flex align-items-center">
                    <span className="mr-3">Speed:</span>
                    {[1, 2, 3].map(speed => (
                      <button key={speed} className={`btn ${playbackSpeed === speed ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => { setPlaybackSpeed(speed) }}>
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </>
            }

            {!playing &&
              <Button className="mr-2" onClick={() => setPlaying(true)}>
                <span><i className="fa fa-play mr-2"></i>Play</span>
              </Button>
            }
          </div>

          <Map
            initialViewState={viewport}
            style={{ width: '100%', height: '620px' }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            onViewportChange={(nextViewport) => setViewport(nextViewport)}
          >
            {/* Houses */}
            {locationList.map((house) => (
              <Marker
                key={house.id}
                longitude={house.longitude}
                latitude={house.latitude}
                anchor="bottom"
              >
                <>
                  <div className="text-center">
                    <i className="fa fa-home mr-3" style={{ fontSize: "1.8rem", color: "black" }} />
                    {energyEvents[house.name] && (
                      <EnergyArrow event={energyEvents[house.name]} />
                    )}
                    <i className="fa fa-solar-panel" style={{ fontSize: "0.8rem", color: pvStatus[house.name] ? "green" : "black" }} />
                  </div>
                </>
              </Marker>
            ))}

            {/* Cars */}
            {carLocationList.map((car) => (
              <Marker
                key={car.id}
                longitude={car.longitude}
                latitude={car.latitude}
                anchor="top"
              >
                <div className="text-center">
                  {carEvents[car.name] && carEvents[car.name].action !== "home" ? (
                    <CarIcon event={carEvents[car.name]} />
                  ) : (
                    <i className="fa fa-car" style={{ fontSize: "1.3rem" }}></i>
                  )}
                </div>
              </Marker>
            ))}
          </Map>
        </>
      )
      }
    </>
  );
};


export default Maps;