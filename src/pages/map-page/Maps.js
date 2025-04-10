import React, { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Modal, Button, Row, Col, Card, CardBody, ListGroup, Collapse } from 'react-bootstrap';

import ChartistGraph from 'react-chartist';
//import HouseDetailsModal from './HouseDetailsModal.js';
import CardEV from '../../components/utils/equipment/CardEV.js';
import CardPV from '../../components/utils/equipment/CardPV.js';

//temporario, depois tirar
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZW9saXZlaXJhMTE5MDc2OSIsImEiOiJjbTJtY3d4aW0wbGh0MnJxdGE2Ym1iazZkIn0.qNlgB4YscwyTcWXyCHfliA'; // replace with your Mapbox token

const locations = [
  { id: 1, name: 'Casa 1', latitude: 38.7223, longitude: -9.1393, icon: 'fa fa-home', description: 'Largo da Lavandeira, 46 r/c direito' },
  { id: 2, name: 'Casa 2', latitude: 41.1579, longitude: -8.6291, icon: 'fa fa-home', description: 'Largo da Lavandeira, 46 r/c direito' },
  { id: 3, name: 'Casa 3', latitude: 37.0194, longitude: -7.9322, icon: 'fa fa-car', description: 'Largo da Lavandeira, 46 r/c direito' },
  { id: 4, name: 'Casa 4', latitude: 40.2033, longitude: -8.4103, icon: 'fa fa-building', description: 'Largo da Lavandeira, 46 r/c direito' },
];

const Maps = () => {
  const [viewport, setViewport] = useState({
    latitude: 39.3999,
    longitude: -8.2245,
    zoom: 6,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);  // State for second modal

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
    setSelectedGraph(null);
  };

  const handleAnchorClick = (location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  return (
    <>
      <Map
        initialViewState={viewport}
        style={{ width: '100%', height: '620px' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
      >
        {locations.map((location) => (
          <Marker key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom">
            <a onClick={() => handleAnchorClick(location)}>
              <i className={location.icon}
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                title={location.description} />
            </a>
          </Marker>
        ))}
      </Map>

      <HouseDetailsModal
        isOpen={isModalOpen}
        selectedLocation={selectedLocation}
        selectedGraph={selectedGraph}
        closeModal={closeModal}
        setSelectedGraph={setSelectedGraph}
        setIsCardModalOpen={setIsCardModalOpen}
      />

      <CardDetailsModal
        isOpen={isCardModalOpen}
        closeModal={() => setIsCardModalOpen(false)}
        selectedGraph={selectedGraph}
      />
    </>
  );
};

function HouseDetailsModal({ isOpen, selectedLocation, selectedGraph, closeModal, setSelectedGraph, setIsCardModalOpen }) {
  //Será calculado dinamicamente vindo do backend
  const dataEV1 = [
    { name: "0", netBuilding: 0.677881, ownConsumption: 0.75, charging: 6 },
    { name: "1", netBuilding: 1.431464, ownConsumption: 0.95, charging: 6 },
    { name: "2", netBuilding: 1.310170, ownConsumption: 1.00, charging: 6 },
    { name: "3", netBuilding: 1.217981, ownConsumption: 1.35, charging: 6 },
    { name: "4", netBuilding: 1.192339, ownConsumption: 1.60, charging: 6 },
    { name: "5", netBuilding: 1.585812, ownConsumption: 1.20, charging: 6 },
    { name: "6", netBuilding: 2.192805, ownConsumption: 0.95, charging: 0 },
    { name: "7", netBuilding: 1.119417, ownConsumption: 1.20, charging: 0 },
    { name: "8", netBuilding: 5.238450, ownConsumption: 1.85, charging: 0 },
    { name: "9", netBuilding: -0.031812, ownConsumption: 0.55, charging: 0 },
    // { name: "10", netBuilding: -0.676953, ownConsumption: 0.90, charging: 0 },
    // { name: "11", netBuilding: 0.677881, ownConsumption: 0.75, charging: 0 },
    // { name: "12", netBuilding: 1.431464, ownConsumption: 0.95, charging: 0 },
    // { name: "13", netBuilding: 1.310170, ownConsumption: 1.00, charging: 0 },
    // { name: "14", netBuilding: 1.217981, ownConsumption: 1.35, charging: 0 },
    // { name: "15", netBuilding: 1.192339, ownConsumption: 1.60, charging: 6 },
    // { name: "16", netBuilding: 1.585812, ownConsumption: 1.20, charging: 6 },
    // { name: "17", netBuilding: 2.192805, ownConsumption: 0.95, charging: 6 },
    // { name: "18", netBuilding: 1.119417, ownConsumption: 1.20, charging: 6 },
    // { name: "19", netBuilding: 5.238450, ownConsumption: 1.85, charging: 6 },
    // { name: "20", netBuilding: -0.031812, ownConsumption: 0.55, charging: 6 },
    { name: "21", netBuilding: -0.676953, ownConsumption: 0.90, charging: 6 }
  ];

  const dataEV2 = [
    { name: "0", netBuilding: "0.824943", ownConsumption: "2.21" },
    { name: "1", netBuilding: "-1.174392", ownConsumption: "0.91" },
    { name: "2", netBuilding: "0.361219", ownConsumption: "1.24" },
    { name: "3", netBuilding: "0.577301", ownConsumption: "1.73" },
    { name: "4", netBuilding: "-0.868451", ownConsumption: "1.95" },
    { name: "5", netBuilding: "-1.234558", ownConsumption: "1.16" },
    { name: "6", netBuilding: "0.427117", ownConsumption: "2.09" },
    { name: "7", netBuilding: "1.315422", ownConsumption: "0.97" },
    { name: "8", netBuilding: "0.755213", ownConsumption: "2.34" },
    { name: "9", netBuilding: "-0.573688", ownConsumption: "1.19" }
    // { name: "10", netBuilding: "1.235445", ownConsumption: "1.53" },
    // { name: "11", netBuilding: "-1.122968", ownConsumption: "0.98" },
    // { name: "12", netBuilding: "0.426437", ownConsumption: "2.12" },
    // { name: "13", netBuilding: "-0.013102", ownConsumption: "1.82" },
    // { name: "14", netBuilding: "-0.297276", ownConsumption: "2.34" },
    // { name: "15", netBuilding: "0.911636", ownConsumption: "1.65" },
    // { name: "16", netBuilding: "-0.098453", ownConsumption: "1.76" },
    // { name: "17", netBuilding: "0.349110", ownConsumption: "2.26" },
    // { name: "18", netBuilding: "-0.358932", ownConsumption: "1.41" },
    // { name: "19", netBuilding: "1.104303", ownConsumption: "0.84" },
    // { name: "20", netBuilding: "-1.056229", ownConsumption: "1.09" },
    // { name: "21", netBuilding: "0.636034", ownConsumption: "2.49" }
  ]

  const dataPV1 = [
    { name: "Morning", uv: 300, pv: 200, amt: 400 },
    { name: "Noon", uv: 500, pv: 400, amt: 600 },
    { name: "Evening", uv: 200, pv: 100, amt: 300 },
  ];

  const dataPV2 = [
    { name: "Morning", uv: 250, pv: 150, amt: 350 },
    { name: "Noon", uv: 600, pv: 450, amt: 650 },
    { name: "Evening", uv: 180, pv: 80, amt: 280 },
  ];

  const evDataMap = {
    "EV 1": { data: dataEV1, title: "Electric Vehicle 1" },
    "EV 2": { data: dataEV2, title: "Electric Vehicle 2" },
  };

  const pvDataMap = {
    "PV 1": { data: dataPV1, title: "Photovoltaic System 1" },
    "PV 2": { data: dataPV2, title: "Photovoltaic System 2" },
  };

  const selectedData = evDataMap[selectedGraph] || pvDataMap[selectedGraph] || {};

  return (
    <Modal show={isOpen} onHide={closeModal} backdrop="static" keyboard={false} size="xl">
      <Modal.Header className="py-0 d-flex align-items-center">
        <Modal.Title>
          {selectedLocation ? selectedLocation.name : 'Location Details'}
          <p>{selectedLocation ? selectedLocation.description : 'No details available.'}</p>
        </Modal.Title>
        <Button className='mb-4' variant="danger" type="button" size="xs" onClick={closeModal}>
          <i className="fa fa-times"></i>
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col lg="5">
            <TreeList setSelectedGraph={setSelectedGraph} />
          </Col>
          <Col lg="7">
            <Card>
              <CardBody>
                <ResponsiveContainer width={"100%"} height={300}>
                  <BarChart data={dataEV1}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="netBuilding" stackId="a" fill="#8884d8" />
                    <Bar dataKey="ownConsumption" stackId="a" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
            {selectedGraph &&
              <Card> {/* Open second modal on click */}
                <CardBody>
                  {/* Conditionally render components */}
                  {selectedGraph.startsWith("EV") && <CardEV data={selectedData.data} title={selectedData.title} />}
                  {selectedGraph.startsWith("PV") && <CardPV data={selectedData.data} title={selectedData.title} />}
                </CardBody>
              </Card>
            }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

function CardDetailsModal({ isOpen, closeModal, selectedGraph }) {
  // Data for Bar Chart
  var dataBar = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
      [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
    ]
  };
  var optionsBar = {
    seriesBarDistance: 10,
    axisX: {
      showGrid: false
    },
    height: "245px"
  };
  var responsiveBar = [
    ['screen and (max-width: 640px)', {
      seriesBarDistance: 5,
      axisX: {
        labelInterpolationFnc: function (value) {
          return value[0];
        }
      }
    }]
  ];

  return (
    <Modal show={isOpen} onHide={closeModal} backdrop="static" keyboard={false} size="lg">
      <Modal.Header className="py-0 d-flex align-items-center">
        <Modal.Title>
          <p>{selectedGraph} - Details</p>
        </Modal.Title>
        <Button className='mb-4' variant="danger" type="button" size="xs" onClick={closeModal}>
          <i className="fa fa-times"></i>
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <ChartistGraph
                  data={dataBar}
                  type="Bar"
                  options={optionsBar}
                  responsiveOptions={responsiveBar}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

function TreeList({ setSelectedGraph }) {
  const [open, setOpen] = useState({
    link1: false,
    link2: false,
  });

  const [selectedItem, setSelectedItem] = useState(null); // State to track selected item

  const toggleItem = (item) => {
    setOpen((prevState) => ({ ...prevState, [item]: !prevState[item] }));
  };

  const handleItemClick = (item, graph) => {
    setSelectedItem(item);       // Update the selected item
    setSelectedGraph(graph);      // Update the selected graph as before
  };

  return (
    <ListGroup as="div" variant="flush" className='border border-1'
      style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <ListGroup.Item action onClick={() => toggleItem("link1")}
        aria-expanded={open.link1}
        style={{ backgroundColor: '#80808052' }}>
        EVs
      </ListGroup.Item>
      <Collapse in={open.link1}>
        <ListGroup variant="flush" className="ml-3">
          <ListGroup.Item
            action
            href="#link1-1"
            onClick={() => handleItemClick('link1-1', 'EV 1')}
            active={selectedItem === 'link1-1'}>
            <span>EV 1</span>
          </ListGroup.Item>
          <ListGroup.Item
            action
            href="#link1-2"
            onClick={() => handleItemClick('link1-2', 'EV 2')}
            active={selectedItem === 'link1-2'}>
            <span>EV 2</span>
          </ListGroup.Item>
        </ListGroup>
      </Collapse>

      <ListGroup.Item action onClick={() => toggleItem("link2")}
        aria-expanded={open.link2}
        style={{ backgroundColor: '#80808052' }}>
        PVs
      </ListGroup.Item>
      <Collapse in={open.link2}>
        <ListGroup variant="flush" className="ml-3">
          <ListGroup.Item
            action
            href="#link2-1"
            onClick={() => handleItemClick('link2-1', 'PV 1')}
            active={selectedItem === 'link2-1'}>
            <span>PV 1</span>
          </ListGroup.Item>
          <ListGroup.Item
            action
            href="#link2-2"
            onClick={() => handleItemClick('link2-2', 'PV 2')}
            active={selectedItem === 'link2-2'}>
            <span>PV 2</span>
          </ListGroup.Item>
        </ListGroup>
      </Collapse>
    </ListGroup>
  );
}

export default Maps;