import React, { useState } from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import CreateSimulationModal from "../../components/shared/CreateSimulationModal";

function SimualtionListPage() {
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <Container fluid>
        <Row>
          <Col>
            <h4 className="d-flex align-items-center m-0">5 Items Found</h4>
          </Col>
          <Col className="d-flex flex-row-reverse">
            <Button className="d-flex align-items-center mb-3" onClick={handleShow}>
              <i className="fa fa-plus"></i>New Simulation</Button>
          </Col>
          <CreateSimulationModal show={show} onClose={handleClose} />
          <SimulationsList />
        </Row>
      </Container>
    </>
  );
}

function SimulationsList() {
  const simulations = [];
  for (let i = 0; i < 5; i++) {
    simulations.push(
      <Col md="12" key={i}>
        <Card className="mb-2">
          <Card.Header className="d-flex justify-content-between">
            <p className="card-category">
              Created using Montserrat Font Family
            </p>
            <i className="fa fa-trash text-danger"></i>
          </Card.Header>
          <Card.Body>
            <div className="typography-line">
              <span>Muted Text</span>
              <p className="text-muted">
                I will be the leader of a company that ends up being worth
                billions of dollars, because I got the answers...
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  }
  return simulations;
}

export default SimualtionListPage;
