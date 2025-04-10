import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Modal, Button, Row, Col, Card, CardBody, ListGroup, Collapse } from 'react-bootstrap';

import CardEV from '../../components/utils/equipment/CardEV.js';
import CardPV from '../../components/utils/equipment/CardPV.js';

function HouseDetailsModal({ isOpen, selectedLocation, selectedGraph, closeModal, setSelectedGraph, setIsCardModalOpen }) {
    //Será calculado dinamicamente vindo do backend
    const dataEV1 = [
        { name: "Jan", uv: 4000, pv: 2400, amt: 2400 },
        { name: "Feb", uv: 3000, pv: 1398, amt: 2210 },
        { name: "Mar", uv: 2000, pv: 9800, amt: 2290 },
    ];

    const dataEV2 = [
        { name: "Apr", uv: 2780, pv: 3908, amt: 2000 },
        { name: "May", uv: 1890, pv: 4800, amt: 2181 },
        { name: "Jun", uv: 2390, pv: 3800, amt: 2500 },
    ];

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
                                        <Bar dataKey="pv" fill="#8884d8" />
                                        <Bar dataKey="uv" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>
                        {selectedGraph &&
                            <Card onClick={() => setIsCardModalOpen(true)} style={{ cursor: 'pointer' }}> {/* Open second modal on click */}
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

export default HouseDetailsModal;