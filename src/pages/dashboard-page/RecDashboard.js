import React, { useState } from "react";
import { Container, Tab, Tabs, Row, Col, Card, CardBody, Button, ListGroup, Collapse } from "react-bootstrap";
import { FaIndustry, FaPlug, FaBolt, FaBuilding, FaBatteryFull } from "react-icons/fa";
import SelectSimulationModal from "../../components/shared/SelectSimulationModal";
import CardEV from "../../components/utils/equipment/CardEV.js";
import CardPV from "../../components/utils/equipment/CardPV.js";
import Papa from "papaparse";
import CardProduction from "components/utils/building/CardProduction";
import CardConsumption from "components/utils/building/CardConsumption";
import CardCharger from "components/utils/equipment/CardCharger";
import CardBattery from "components/utils/equipment/CardBattery";
import { useEffect } from "react";

function RecDashboard() {
  const [show, setShow] = useState(false);
  const [selectedSimulations, setSelectedSimulations] = useState([]);

  const [selectedSimulationGraph, setSelectedSimulationGraph] = useState({});
  const [selectedSimulationEquipment, setSelectedSimulationEquipment] = useState({});

  const handleOpen = () => setShow(true);
  const handleSimulationSelection = (simulations) => {
    setSelectedSimulations(simulations);
  };

  const handleGraphSelection = (simulation, graphData) => {
    setSelectedSimulationGraph(prev => ({
      ...prev,
      [simulation]: graphData,
    }));
  };

  const handleEquipmentSelection = (simulation, equipmentData) => {
    setSelectedSimulationEquipment(prev => ({
      ...prev,
      [simulation]: equipmentData,
    }));
  };

  // Files and parsed folder data
  const [simulationFolders, setSimulationFolders] = useState([]);
  const [parsedSimulations, setParsedSimulations] = useState({});
  const [fileMapByFolder, setFileMapByFolder] = useState({});

  //Reads the selected folder information and stores it
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
    if (!selectedSimulations.length || Object.keys(fileMapByFolder).length === 0) return;

    setParsedSimulations((prevParsed) => {
      const updatedParsed = { ...prevParsed };
      let totalFiles = 0;
      let parsedFiles = 0;

      selectedSimulations.forEach((folderName) => {
        // Skip if already parsed
        if (updatedParsed[folderName]) return;

        const fileMap = fileMapByFolder[folderName];
        if (!fileMap) return;

        updatedParsed[folderName] = {};
        const dataFiles = Object.entries(fileMap).filter(
          ([fileName]) => !/kpi(s)?/i.test(fileName)
        );

        totalFiles += dataFiles.length;

        dataFiles.forEach(([fileName, file]) => {
          const cleanedFileName = fileName
            .replace("exported_data_", "")
            .replace(/\.[^/.]+$/, "");

          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              updatedParsed[folderName][cleanedFileName] = results.data;
              parsedFiles++;

              if (parsedFiles === totalFiles) {
                console.log("✅ Updated parsed simulations:", updatedParsed);
                // Final update once all are done
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
      });

      return prevParsed;
    });
  }, [selectedSimulations, fileMapByFolder]);


  return (
    <Container fluid>
      <Row>
        <Col>
          <input
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleFolderUpload}
          />
        </Col>
        {simulationFolders.length > 0 && (
          <Col className="d-flex flex-row-reverse">
            <Button variant="primary" onClick={handleOpen}>Select Simulations</Button>
          </Col>
        )}
      </Row>

      <SelectSimulationModal
        onSelectionChange={handleSimulationSelection}
        show={show} setShow={setShow} simulationList={simulationFolders}
      />

      {/* Load tabs only if there are selected simulations */}
      {selectedSimulations.length > 0 && (
        <Tabs defaultActiveKey={selectedSimulations.sort()[0]} id="simulation-tabs" className="mb-3">
          {selectedSimulations.sort().map((simulation, index) => (
            <Tab eventKey={simulation} title={simulation} key={index}>
              <Row>
                <Col lg="3">
                  {parsedSimulations[simulation] && (
                    <DynamicTreeList
                      folderData={parsedSimulations[simulation]}
                      setSelectedGraph={(graphData) => handleGraphSelection(simulation, graphData)}
                      setSelectedEquipment={(equipmentData) => handleEquipmentSelection(simulation, equipmentData)}
                    />
                  )}
                </Col>
                <Col lg="9">
                  {/* Render selected graph */}
                  {selectedSimulationGraph[simulation] && selectedSimulationGraph[simulation].data && (
                    <Card>
                      <CardBody>
                        {selectedSimulationGraph[simulation].title.includes("Production") && (
                          <CardProduction data={selectedSimulationGraph[simulation].data} title={selectedSimulationGraph[simulation].title} />
                        )}
                        {selectedSimulationGraph[simulation].title.includes("Consumption") && (
                          <CardConsumption data={selectedSimulationGraph[simulation].data} title={selectedSimulationGraph[simulation].title} />
                        )}
                      </CardBody>
                    </Card>
                  )}
                  {/* Render selected equipment */}
                  {selectedSimulationEquipment[simulation] && (
                    <Card>
                      <CardBody>
                        {selectedSimulationEquipment[simulation].title.includes("Electric Vehicle") && (
                          <CardEV data={selectedSimulationEquipment[simulation].data} title={selectedSimulationEquipment[simulation].title} />
                        )}
                        {selectedSimulationEquipment[simulation].title.includes("Charger") && (
                          <CardCharger data={selectedSimulationEquipment[simulation].data} title={selectedSimulationEquipment[simulation].title} />
                        )}
                        {selectedSimulationEquipment[simulation].title.includes("Battery") && (
                          <CardBattery data={selectedSimulationEquipment[simulation].data} title={selectedSimulationEquipment[simulation].title} />
                        )}
                        {selectedSimulationEquipment[simulation].title.includes("Pv") && (
                          <CardPV data={selectedSimulationEquipment[simulation].data} title={selectedSimulationEquipment[simulation].title} />
                        )}
                      </CardBody>
                    </Card>
                  )}
                </Col>
              </Row>
            </Tab>
          ))}
        </Tabs>
      )}
    </Container>
  );
}

// Dynamic tree built from folderData keys
const DynamicTreeList = ({ folderData, setSelectedGraph, setSelectedEquipment }) => {
  const [openBuildings, setOpenBuildings] = useState({});
  const [openEVs, setOpenEVs] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const toggleSection = (id) => {
    setOpenBuildings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEVsSection = () => {
    setOpenEVs((prev) => !prev);
  };

  const handleProductionClick = (building) => {
    setSelectedItem(`${building}_production`);
    setSelectedGraph({ title: `${formatLabel(building)} Production`, data: folderData[building] });
  };

  const handleConsumptionClick = (building) => {
    setSelectedItem(`${building}_consumption`);
    setSelectedGraph({ title: `${formatLabel(building)} Consumption`, data: folderData[building] });
  };

  const handleChargerClick = (charger) => {
    const match = charger.match(/^building_(\d+)_charger_\d+_(\d+)$/);
    setSelectedItem(`${charger}_charger_info`);
    setSelectedEquipment({ title: `Building ${match[1]} - Charger ${match[2]} Data`, data: folderData[charger] });
  };

  const handleBatteryClick = (battery) => {
    const match = battery.match(/^building_(\d+)_battery/);
    setSelectedItem(`${battery}_battery_info`);
    setSelectedEquipment({ title: `Building ${match[1]} - Battery Data`, data: folderData[battery] });
  };

  const handleEVClick = (equipment) => {
    setSelectedItem(`${equipment}_ev_info`);
    setSelectedEquipment({ title: `${formatLabel(equipment)} Data`, data: folderData[equipment] });
  };

  const formatLabel = (label) =>
    label.replace(/_/g, " ").replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  const buildingGroups = {};
  const evsGroup = [];

  Object.keys(folderData).forEach((key) => {
    const normalizedKey = key.toLowerCase();

    const chargerMatch = normalizedKey.match(/^building_(\d+)_charger_\d+_(\d+)$/);
    const batteryMatch = normalizedKey.match(/^building_(\d+)_battery/);
    const isBuilding = normalizedKey.startsWith("building_");
    const isEV = normalizedKey.includes("electric_vehicle");

    if (chargerMatch || batteryMatch) {
      const buildingKey = `building_${(chargerMatch || batteryMatch)[1]}`;

      if (!buildingGroups[buildingKey]) {
        buildingGroups[buildingKey] = { hasData: true, chargers: [], batteries: [] };
      }

      const category = chargerMatch ? "chargers" : "batteries";
      buildingGroups[buildingKey][category].push(key);
    } else if (isBuilding) {
      if (!buildingGroups[normalizedKey]) {
        buildingGroups[normalizedKey] = { hasData: true, chargers: [], batteries: [] };
      }
    } else if (isEV) {
      evsGroup.push(key);
    }
  });

  // --- Sorting buildings normally ---
  const sortedBuildings = [...new Set(Object.keys(buildingGroups))].sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });

  return (
    <ListGroup as="div" variant="flush" className="border border-1" style={{ maxHeight: "875px", overflowY: "auto", overflowX: "hidden" }}>
      {sortedBuildings.map((building) => (
        <React.Fragment key={building}>
          <ListGroup.Item action onClick={() => toggleSection(building)} aria-expanded={openBuildings[building] || false}
            className="d-flex align-items-center" style={{ fontWeight: "bold", backgroundColor: "#e9ecef" }}>
            <FaBuilding style={{ marginRight: "8px" }} />
            {formatLabel(building)}
          </ListGroup.Item>
          <Collapse in={openBuildings[building]}>
            <div style={{ marginLeft: "1rem" }}>
              <ListGroup.Item action onClick={() => handleProductionClick(building)} active={selectedItem === `${building}_production`}>
                <FaIndustry style={{ marginRight: "8px" }} />
                Production
              </ListGroup.Item>
              <ListGroup.Item action onClick={() => handleConsumptionClick(building)} active={selectedItem === `${building}_consumption`}>
                <FaPlug style={{ marginRight: "8px" }} />
                Consumption
              </ListGroup.Item>

              {/* Chargers */}
              {buildingGroups[building].chargers.length > 0 && (
                <>
                  <ListGroup.Item style={{ fontWeight: "bold", backgroundColor: "#e9ecef" }}>
                    <FaPlug style={{ marginRight: "8px" }} />
                    Chargers
                  </ListGroup.Item>
                  {buildingGroups[building].chargers.sort().map((charger, index) => (
                    <ListGroup.Item key={charger} action onClick={() => handleChargerClick(charger)} active={selectedItem === `${charger}_charger_info`}
                      className="d-flex align-items-center" style={{ marginLeft: "1rem" }}>
                      <FaPlug style={{ marginRight: "8px" }} />
                      Charger {index + 1}
                    </ListGroup.Item>
                  ))}
                </>
              )}

              {/* Batteries */}
              {buildingGroups[building].batteries.length > 0 && (
                <>
                  <ListGroup.Item style={{ fontWeight: "bold", backgroundColor: "#e9ecef" }}>
                    <FaBatteryFull style={{ marginRight: "8px" }} />
                    Batteries
                  </ListGroup.Item>
                  {buildingGroups[building].batteries.sort().map((battery, index) => (
                    <ListGroup.Item key={battery} action onClick={() => handleBatteryClick(battery)} active={selectedItem === `${battery}_battery_info`}
                      className="d-flex align-items-center" style={{ marginLeft: "1rem" }}>
                      <FaBatteryFull style={{ marginRight: "8px" }} />
                      Battery {index + 1}
                    </ListGroup.Item>
                  ))}
                </>
              )}
            </div>
          </Collapse>
        </React.Fragment>
      ))}

      {/* EVs Section */}
      {evsGroup.length > 0 && (
        <React.Fragment>
          <ListGroup.Item
            className="d-flex align-items-center"
            style={{ fontWeight: "bold", backgroundColor: "#e9ecef" }}
            action onClick={toggleEVsSection}
            aria-expanded={openEVs}>
            <FaBolt style={{ marginRight: "8px" }} />
            EVs
          </ListGroup.Item>
          <Collapse in={openEVs}>
            <div style={{ marginLeft: "1rem" }}>
              {evsGroup.sort().map((ev) => (
                <ListGroup.Item key={ev} action onClick={() => handleEVClick(ev)}
                  active={selectedItem === `${ev}_ev_info`}>
                  <FaBolt style={{ marginRight: "8px" }} />
                  {formatLabel(ev)}
                </ListGroup.Item>
              ))}
            </div>
          </Collapse>
        </React.Fragment>
      )}
    </ListGroup>
  );
};

export default RecDashboard;
