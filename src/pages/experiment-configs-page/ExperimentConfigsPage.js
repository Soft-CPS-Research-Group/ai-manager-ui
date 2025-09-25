import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Card, Modal, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from "react-paginate";
import '../../assets/css/pagination.css';

function ExperimentConfigsPage() {
    const [loading, setLoading] = useState(false);

    const [showList, setShowList] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    const [configList, setConfigList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [configToDelete, setConfigToDelete] = useState(null);

    const [selectedConfig, setSelectedConfig] = useState({});
    const [configDetails, setConfigDetails] = useState({});
    const [showConfigDetailsModal, setShowConfigDetailsModal] = useState(false);

    const [fileName, setFileName] = useState("");
    const [jsonText, setJsonText] = useState("");
    const [jsonConfig, setJsonConfig] = useState({});
    const [isValidJson, setIsValidJson] = useState(true);

    const isValidFileName = (name) => {
        const regex = /^(?!.*\.\.)(?!.*\/)(?!.*\\)(?!.*\.$)[\w\- ]+\.[\w]+$/;
        return regex.test(name);
    };
    const fileNameIsValid = isValidFileName(fileName);

    //Pagination Settings
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);

    const offset = currentPage * itemsPerPage;
    const currentItems = configList.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(configList.length / itemsPerPage);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await fetch("experiment-configs");
            const json = await res.json();
            if (json) {
                setConfigList(json);
            }
        } catch (err) {
            toast.error('Failed to fetch the configs.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchConfigDetails = async (config) => {
        try {
            const res = await fetch(`experiment-config/${config}`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            } else {
                const json = await res.json();
                if (json) {
                    setConfigDetails(json.config);
                    setShowConfigDetailsModal(true);
                }
            }
        } catch (err) {
            toast.error('Failed to fetch the configs.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    const handleDeleteConfirmed = async () => {
        try {
            await fetch(`experiment-config/${configToDelete}`, { method: 'DELETE' });

            setConfigList((prev) => prev.filter(item => item !== configToDelete));
            setShowDeleteModal(false);

            toast.success('Config deleted successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        } catch (err) {
            toast.error('Failed to delete the config.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    const handleFileName = async (e) => {
        const file = e.target.value;
        setFileName(file);
    };

    const handleConfigChange = async (e) => {
        const newText = e.target.value;
        setJsonText(newText);

        try {
            const parsedJson = JSON.parse(newText);
            setJsonConfig(parsedJson);
            setIsValidJson(true);
        } catch (error) {
            setIsValidJson(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            const body = {
                file_name: fileName,
                config: jsonConfig
            };

            const response = await fetch("experiment-config/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success('Config created successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            } else {
                toast.error('Error creating config!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            }
        } catch (error) {
            toast.error('Error creating config!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    return (
        <>
            <Row>
                <Col className="d-flex justify-content-between align-items-center">
                    <div>
                        {showList &&
                            <h4 className="d-flex align-items-center m-0">{configList.length} Items Found</h4>
                        }
                    </div>
                    <div>
                        {!showCreate && <Button variant="primary" onClick={() => {
                            setShowList(false);
                            setShowCreate(true);
                        }}>New Config</Button>}
                        {showCreate && <Button className="mr-2" variant={fileNameIsValid ? "primary" : "secondary"}
                            onClick={handleSaveConfig} disabled={!fileNameIsValid}>Save Config</Button>}
                        {showCreate && <Button variant="danger" onClick={() => {
                            setShowList(true);
                            setShowCreate(false);
                        }}>Cancel</Button>}
                    </div>
                </Col>
                <ToastContainer />
            </Row>

            {loading && showList &&
                <Spinner className="mt-4" animation="border" />
            }

            {!loading && showList && (configList.length > 0) && (
                <>
                    <Row className="mt-4">
                        {currentItems.length > 0 &&
                            currentItems.map((config, index) => (
                                <Col md="6" key={index}>
                                    <Card className="mb-2">
                                        <Card.Header className="d-flex justify-content-between py-3">
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedConfig(config);
                                                fetchConfigDetails(config);
                                            }}><b>{config}</b></a>

                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                setConfigToDelete(config);
                                                setShowDeleteModal(true);
                                            }} className="pe-auto"
                                            >
                                                <i className="fa fa-trash text-danger"></i>
                                            </a>
                                        </Card.Header>
                                    </Card>
                                </Col>
                            ))
                        }
                    </Row>
                    <ReactPaginate
                        previousLabel={"Prev"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={(event) => setCurrentPage(event.selected)}
                        containerClassName={"pagination justify-content-center mt-4"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        activeClassName={"active"}
                    />

                    {/* Config details modal */}
                    <Modal size="lg" show={showConfigDetailsModal} onHide={() => setShowConfigDetailsModal(false)}>
                        <div className="py-0 px-3 d-flex align-items-center justify-content-between">
                            <h3>{selectedConfig} details</h3>
                            <Button variant="danger" type="button" size="xs" onClick={() => setShowConfigDetailsModal(false)}>
                                <i className="fa fa-times"></i>
                            </Button>
                        </div>
                        <Modal.Body style={{
                            height: "50vh",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <textarea
                                value={JSON.stringify(configDetails, null, 2)}
                                readOnly={true}

                                style={{
                                    width: "100%",
                                    height: "100%",
                                    fontFamily: "monospace",
                                    fontSize: "14px",
                                    padding: "10px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    resize: "none",
                                    backgroundColor: "white"
                                }}
                            />
                        </Modal.Body>
                    </Modal>

                    {/* Delete confirmation modal */}
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                        <div className="py-0 px-3 d-flex align-items-center justify-content-between">
                            <h3>Confirm Delete</h3>
                            <Button variant="danger" type="button" size="xs" onClick={() => setShowDeleteModal(false)}>
                                <i className="fa fa-times"></i>
                            </Button>
                        </div>
                        <Modal.Body>
                            Are you sure you want to delete the config <b>{configToDelete}</b>?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleDeleteConfirmed()}
                            >
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )
            }

            {/* Form for input data */}
            {showCreate && (
                <>
                    <Row className="mt-3">
                        <Col>
                            <Card.Title>File Name:</Card.Title>
                            <Form.Control className="w-25" type="text" name="name" value={fileName} onChange={handleFileName} aria-label="File Name" />
                            {fileName != "" && !fileNameIsValid && (
                                <div className="text-danger mt-1">
                                    File name is invalid
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <Card.Title>Config Attributes:</Card.Title>
                            <textarea
                                value={jsonText}
                                style={{
                                    width: "100%",
                                    height: "200px",
                                    fontFamily: "monospace",
                                    fontSize: "14px",
                                    padding: "10px",
                                    border: isValidJson ? "1px solid #ccc" : "2px solid red",
                                    borderRadius: "5px",
                                    resize: "vertical",
                                    backgroundColor: isValidJson ? "white" : "#ffe5e5"
                                }}
                                onChange={handleConfigChange} aria-label="Config Attributes"
                            />
                            {!isValidJson && (
                                <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                    Invalid JSON format. Please fix syntax errors.
                                </p>
                            )}
                        </Col>
                    </Row>
                </>
            )
            }
        </>
    );
}

export default ExperimentConfigsPage;
