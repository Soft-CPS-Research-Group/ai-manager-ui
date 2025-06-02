import React, { useState, useRef, useEffect } from "react";
import {
    Button,
    Row,
    Col,
    Form,
    Card
} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';

function ExperimentConfigsPage() {
    const [show, setShow] = useState(false);
    const [fileName, setFileName] = useState("");
    const [jsonText, setJsonText] = useState("");
    const [jsonConfig, setJsonConfig] = useState({});
    const [isValidJson, setIsValidJson] = useState(true);

    const isValidFileName = (name) => {
        const regex = /^(?!.*\.\.)(?!.*\/)(?!.*\\)(?!.*\.$)[\w\- ]+\.[\w]+$/;
        return regex.test(name);
    };
    const fileNameIsValid = isValidFileName(fileName);

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

            console.log(body);

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
                <Col className="d-flex flex-row-reverse">
                    {!show && <Button variant="primary" onClick={() => setShow(true)}>New Config</Button>}
                    {show && <Button variant={fileNameIsValid ? "primary" : "secondary"} onClick={handleSaveConfig} disabled={!fileNameIsValid}>Save Config</Button>}
                    {show && <Button variant="danger" style={{ marginRight: 15 }} onClick={() => setShow(false)}>Cancel</Button>}
                </Col>
                <ToastContainer />
            </Row>

            {/* Form for input data */}
            {show && (
                <>
                    <Row className="mt-3">
                        <Col>
                            <Card.Title>File Name:</Card.Title>
                            <Form.Control className="w-25" type="text" name="name" value={fileName} onChange={handleFileName} aria-label="File Name"/>
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
            )}
        </>
    );
}

export default ExperimentConfigsPage;
