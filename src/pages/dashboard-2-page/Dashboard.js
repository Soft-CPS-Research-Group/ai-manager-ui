import React, { useState } from "react";
import {
    Button,
    Card,
    Table,
    Container,
    Row,
    Col,
    Tab,
    Tabs
} from "react-bootstrap";

function Dashboard() {
    return (
        <>
            <Container fluid>
                <Tabs defaultActiveKey={"0"} id="simulation-tabs" className="mb-3">
                    <Tab eventKey={"0"} title={"Tab1"} key={"0"}>
                        <Row>
                            <Col lg="3">
                                Tab 1
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey={"1"} title={"Tab2"} key={"1"}>
                        <Row>
                            <Col lg="3">
                                Tab 2
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey={"2"} title={"Tab3"} key={"2"}>
                        <Row>
                            <Col lg="3">
                                Tab 3
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            </Container>
        </>
    );
}

export default Dashboard;
