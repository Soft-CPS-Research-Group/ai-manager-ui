import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card, Modal, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { FaPlay } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import '../../assets/css/pagination.css';

function RunSimulations() {
    const [loading, setLoading] = useState(false);

    const [showList, setShowList] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    const [jobList, setJobList] = useState([]);

    const [jobToStop, setJobToStop] = useState(null);
    const [showStopModal, setShowStopModal] = useState(false);

    const [jobToDelete, setJobToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedJob, setSelectedeJob] = useState(null);

    const [jobProgress, setJobProgress] = useState({});
    const [jobResults, setJobResults] = useState(null);
    const [showResultsModal, setShowResultsModal] = useState(false);

    const [jobLogs, setJobLogs] = useState(null);
    const [jobFileLogs, setJobFileLogs] = useState(null);
    const [showLogsModal, setShowLogsModal] = useState(false);

    const [file, setFile] = useState("");
    const [availableFiles, setAvailableFiles] = useState([]);

    const [targetContainer, setTargetContainer] = useState("");
    const [availableHosts, setAvailableHosts] = useState([]);

    // Pagination Settings
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);

    const offset = currentPage * itemsPerPage;
    const currentItems = jobList.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(jobList.length / itemsPerPage);

    useEffect(() => {
        fetchHosts();
        fetchFiles();
        fetchJobs();
    }, []);

    // When jobList gets populated, fetch the progress
    useEffect(() => {
        if (jobList.length > 0) {
            fetchAllJobProgress();
        }
    }, [jobList]);

    // Get hosts list
    const fetchHosts = async () => {
        try {
            const res = await fetch("hosts");
            const json = await res.json();
            if (json.available_hosts) {
                setAvailableHosts(json.available_hosts);
                setTargetContainer(json.available_hosts[0]?.host || "");
            }
        } catch (err) {
            toast.error('Failed to fetch the hosts.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Get config files
    const fetchFiles = async () => {
        try {
            const res = await fetch("experiment-configs");
            const json = await res.json();
            if (json) {
                setAvailableFiles(json);
                setFile(json[0] || "");
            }
        } catch (err) {
            toast.error('Failed to fetch the configs.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Get job list
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch("jobs");
            const json = await res.json();
            if (json) {
                setJobList(json);
            }
        } catch (err) {
            toast.error('Failed to fetch the jobs.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        } finally {
            setLoading(false);
        }
    };

    // Get job progress
    const fetchJobProgress = async (job) => {
        try {
            const res = await fetch(`progress/${job}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const json = await res.json();

            setJobProgress((prev) => ({
                ...prev,
                [job]: {
                    job_id: job,
                    progress_info: json,
                },
            }));

            console.log(jobProgress)
        } catch (err) {
            toast.error(`Failed to fetch the job ${job} process.`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    const fetchAllJobProgress = async () => {
        jobList.forEach((job) => {
            fetchJobProgress(job.job_id);
        });
    };

    // Get job results
    const fetchJobResults = async (job) => {
        try {
            const res = await fetch(`result/${job}`);
            const json = await res.json();
            if (json) {
                setJobResults(json);
                setShowResultsModal(true);
            }
        } catch (err) {
            toast.error('Failed to fetch the job results.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Get job logs and file logs
    const fetchLogs = async (job) => {
        fetchJobLogs(job);
        fetchJobFileLogs(job);
        setShowLogsModal(true);
    };

    const fetchJobLogs = async (job) => {
        try {
            const res = await fetch(`logs/${job}`);
            const text = await res.text();
            if (text) {
                setJobLogs(text);
            }
        } catch (err) {
            toast.error('Failed to fetch the job logs.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    const fetchJobFileLogs = async (job) => {
        try {
            const res = await fetch(`file-logs/${job}`);
            const text = await res.text();
            if (text) {
                setJobFileLogs(text);
            }
        } catch (err) {
            toast.error('Failed to fetch the job file logs.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Stop job
    const handleStopConfirmed = async () => {
        try {
            await fetch(`stop/${jobToStop}`, { method: 'POST' });

            setShowStopModal(false);

            toast.success('Job stopped successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
            fetchJobs();
        } catch (err) {
            toast.error('Failed to stop the job.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Delete job
    const handleDeleteConfirmed = async () => {
        try {
            await fetch(`job/${jobToDelete}`, { method: 'DELETE' });

            setJobList((prev) => prev.filter(item => item !== jobToDelete));
            setShowDeleteModal(false);

            toast.success('Job deleted successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        } catch (err) {
            toast.error('Failed to delete the job.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.value);
    }

    const handleTargetChange = (e) => {
        setTargetContainer(e.target.value);
    }

    // Runs the simulation
    const handleRunSimulation = async () => {
        try {
            const jsonOutput = {
                config_path: file,
                target_host: targetContainer,
            };

            const response = await fetch("run-simulation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonOutput)
            });

            if (response.ok) {
                toast.success('Simulation started successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            } else {
                toast.error('Error starting simulation!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            }
        } catch (error) {
            toast.error('Error starting simulation!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Used to translate JSON into a more readable format
    const renderObject = (obj) => (
        <ul>
            {Object.entries(obj).map(([key, value]) => (
                <li key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                    {typeof value === "object" ? renderObject(value) : value.toString()}
                </li>
            ))}
        </ul>
    );

    // List of color for each job state
    const statusColors = {
        launching: "secondary",
        queued: "info",
        dispatched: "primary",
        running: "warning",
        finished: "success",
        failed: "danger",
        stopped: "dark",
        canceled: "secondary",
        not_found: "dark",
        unknown: "secondary"
    };

    return (
        <>
            <Row>
                <Col className="d-flex justify-content-between align-items-center">
                    <div>
                        {showList &&
                            <h4 className="d-flex align-items-center m-0">{jobList.length} Items Found</h4>
                        }
                    </div>
                    <div>
                        {!showCreate && <Button variant="primary" onClick={() => {
                            setShowList(false);
                            setShowCreate(true);
                        }}>Run Simulation</Button>}
                        {showCreate && <Button variant="primary" className="mr-2" onClick={handleRunSimulation}>
                            <FaPlay className="mr-2" />
                            Run
                        </Button>}
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

            {!loading && showList && (jobList.length > 0) && (
                <>
                    <Row className="mt-4">
                        {currentItems.length > 0 &&
                            currentItems.map((job, index) => (
                                <Col md="6" key={index}>
                                    <Card className="mb-2">
                                        <Card.Header className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <span className="pr-2"><b>{job.job_info.job_name}</b></span>
                                                <span className={`text-white badge bg-${statusColors[job.status] || "secondary"}`}>{job.status}</span>
                                            </div>
                                            <div>
                                                {/* Only shows the stop option on certain status */}
                                                {(job.status == "queued" || job.status == "running") &&
                                                    <a href="#" onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedeJob(job.job_info.job_name);
                                                        setJobToStop(job.job_id);
                                                        setShowStopModal(true);
                                                    }} className="pr-2"
                                                    >
                                                        <i className="fa fa-pause text-secondary"></i>
                                                    </a>
                                                }

                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedeJob(job.job_info.job_name);
                                                    setJobToDelete(job.job_id);
                                                    setShowDeleteModal(true);
                                                }} className="pe-auto"
                                                >
                                                    <i className="fa fa-trash text-danger"></i>
                                                </a>
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="pt-0">
                                            <div class="progress mb-3">
                                                <div className="progress-bar" role="progressbar"
                                                    style={{
                                                        width: `${jobProgress?.[job.job_id]?.progress_info?.percent ?? 0}%`
                                                    }}
                                                    aria-valuenow={jobProgress?.[job.job_id]?.progress_info?.percent ?? 0}
                                                    aria-valuemin="0" aria-valuemax="100"
                                                >
                                                    {jobProgress?.[job.job_id]?.progress_info?.percent ?? 0}%
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <Button className="p-2" variant="primary" type="button" onClick={() => {
                                                    setSelectedeJob(job.job_info.job_name);
                                                    fetchJobResults(job.job_id);
                                                }}>
                                                    See Results
                                                </Button>
                                                <Button className="p-2" variant="primary" type="button" onClick={() => {
                                                    setSelectedeJob(job.job_info.job_name);
                                                    fetchLogs(job.job_id)
                                                }}>
                                                    View Logs
                                                </Button>
                                            </div>
                                        </Card.Body>
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

                    {/* Job result details modal */}
                    <Modal show={showResultsModal} onHide={() => setShowResultsModal(false)}>
                        <div className="py-0 px-3 d-flex align-items-center justify-content-between">
                            <h3>{selectedJob} Results</h3>
                            <Button variant="danger" type="button" size="xs" onClick={() => setShowResultsModal(false)}>
                                <i className="fa fa-times"></i>
                            </Button>
                        </div>
                        <Modal.Body style={{
                            maxHeight: "50vh",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            {jobResults && renderObject(jobResults)}
                        </Modal.Body>
                    </Modal>

                    {/* Job logs details modal */}
                    <Modal size="lg" show={showLogsModal} onHide={() => setShowLogsModal(false)}>
                        <div className="py-0 px-3 d-flex align-items-center justify-content-between">
                            <h3>{selectedJob} Logs</h3>
                            <Button variant="danger" type="button" size="xs" onClick={() => setShowLogsModal(false)}>
                                <i className="fa fa-times"></i>
                            </Button>
                        </div>
                        <Modal.Body style={{
                            height: "50vh",
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "auto"
                        }}>
                            <div className="mb-3">
                                <h4 className="mt-0">Job Logs</h4>
                                <textarea
                                    className="form-control" rows={8} value={jobLogs || ""}
                                    style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                                />
                            </div>

                            <div>
                                <h4 className="mt-0">File Logs</h4>
                                <textarea
                                    className="form-control" rows={8} value={jobFileLogs || ""}
                                    style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                                />
                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* Stop confirmation modal */}
                    <Modal show={showStopModal} onHide={() => setShowStopModal(false)}>
                        <div className="py-0 px-3 d-flex align-items-center justify-content-between">
                            <h3>Confirm Stop</h3>
                            <Button variant="danger" type="button" size="xs" onClick={() => setShowStopModal(false)}>
                                <i className="fa fa-times"></i>
                            </Button>
                        </div>
                        <Modal.Body>
                            Are you sure you want to stop the job <b>{selectedJob}</b>?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowStopModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleStopConfirmed}
                            >
                                Stop
                            </Button>
                        </Modal.Footer>
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
                            Are you sure you want to delete the job <b>{selectedJob}</b>?
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
            )}

            {showCreate &&
                <>
                    <Row className="mt-3">
                        <Col>
                            <Card.Title>File Name:</Card.Title>
                            <select value={file} onChange={handleFileChange} className="w-25"
                                style={{ padding: "5px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "5px", width: "100%" }}
                                aria-label="File Name">
                                {availableFiles.map((file, index) => (
                                    <option key={index} value={file}>
                                        {file}
                                    </option>
                                ))}
                            </select>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <Card.Title>Target Container:</Card.Title>
                            <select value={targetContainer} onChange={handleTargetChange} className="w-25"
                                style={{ padding: "5px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "5px", width: "100%" }}
                                aria-label="Target Container">
                                {availableHosts.map((host, index) => (
                                    <option key={index} value={host.name}>
                                        {host.name}
                                    </option>
                                ))}
                            </select>
                        </Col>
                    </Row>
                </>
            }
        </>
    );
}

export default RunSimulations;
