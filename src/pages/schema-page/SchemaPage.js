import React, { useState, useCallback, useEffect } from "react";
import { Row, Col, Button, Form, Card, Modal, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FaBuilding, FaCar, FaPlug, FaBolt, FaSnowflake, FaFireAlt, FaBox } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import '../../assets/css/pagination.css';

// Custom node with that represents elements from the schema
import CustomNode from "./CustomNode";

// Sidebar for dragging elements
const Sidebar = ({ onDragStart }) => (
    <div style={{ width: 200, paddingRight: 10, background: "#f4f4f4" }}>
        <div draggable onDragStart={(e) => onDragStart(e, "building")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaBuilding /> Building
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "ev")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaCar /> Electric Vehicle
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "charger")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaPlug /> Charger
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "pv")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaBolt /> PV
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "cooling_device")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaSnowflake /> Cooling Device
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "heating_device")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaFireAlt /> Heating Device
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "dhw_device")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaFireAlt /> DHW Device
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "dhw_storage")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaBox /> DHW Storage
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "cooling_storage")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaBox /> Cooling Storage
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "heating_storage")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaBox /> Heating Storage
        </div>
        <div draggable onDragStart={(e) => onDragStart(e, "electrical_storage")} style={{ padding: 10, background: "#ddd", marginBottom: 10, cursor: "grab", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaBox /> Electrical Storage
        </div>
    </div>
);

export default function SchemaPage() {
    const [loading, setLoading] = useState(false);

    const [showList, setShowList] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    const [siteList, setSiteList] = useState([]);
    const [siteSchemaInfo, setSiteSchemaInfo] = useState([]);

    const [selectedSite, setSelectedSite] = useState({});
    const [showSiteSchemaModal, setShowSiteSchemaModal] = useState(false);

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [nodeCounts, setNodeCounts] =
        useState({
            building: 0, ev: 0, pv: 0, charger: 0,
            cooling_device: 0, heating_device: 0, dhw_device: 0,
            cooling_storage: 0, heating_storage: 0, dhw_storage: 0, electrical_storage: 0
        });

    const [selectedNodes, setSelectedNodes] = useState([]);
    const [copiedNode, setCopiedNode] = useState(null);

    const [siteName, setSiteName] = useState("");
    const handleSiteChange = async (e) => {
        const site = e.target.value;
        setSiteName(site);
    };

    //Pagination Settings
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);

    const offset = currentPage * itemsPerPage;
    const currentItems = siteList.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(siteList.length / itemsPerPage);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const res = await fetch("sites");
            const json = await res.json();
            if (json.sites) {
                setSiteList(json.sites);
            }
        } catch (err) {
            toast.error('Failed to fetch the sites.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSiteSchema = async (site) => {
        try {
            const res = await fetch(`schema/${site}`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            } else {
                const json = await res.json();
                if (json) {
                    setSiteSchemaInfo(json);
                    setShowSiteSchemaModal(true);
                }
            }
        } catch (err) {
            toast.error('Failed to fetch the site schema.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    // Track selected nodes
    const handleSelectionChange = useCallback(({ nodes: selected }) => {
        setSelectedNodes(selected);
    }, []);

    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey || event.metaKey) {
            if (event.key === "c") {
                // Copy the first selected node
                if (selectedNodes.length === 1) {
                    setCopiedNode(selectedNodes[0]);
                }
            }
            if (event.key === "v" && copiedNode) {
                // Paste new node with a new ID and position offset
                setNodes((prevNodes) => [
                    ...prevNodes,
                    {
                        ...copiedNode,
                        id: `${copiedNode.id}-copy-${Date.now()}`,
                        position: {
                            x: copiedNode.position.x + 50,
                            y: copiedNode.position.y + 50,
                        },
                        data: {
                            ...copiedNode.data,
                            label: `${copiedNode.data.label}_1`, // Append "_1" to label
                        },
                        selected: false,
                    }
                ]);
            }
        }
    }, [copiedNode, selectedNodes, setNodes]);

    useEffect(() => {
        fetchSites();
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleSaveSchema = async () => {
        const schema = {
            electric_vehicles_def: {},
            buildings: {}
        };

        nodes.forEach((node) => {
            switch (node.data.type) {
                case "ev": {
                    schema.electric_vehicles_def[node.data.label] = {
                        include: true,
                        energy_simulation: node.data.formData.energy_simulation,
                        battery: {
                            type: "citylearn.energy_model.Battery",
                            autosize: false,
                            attributes: Object.fromEntries(
                                Object.entries(node.data.formData).map(([key, value]) => [
                                    key,
                                    isNaN(value) ? value : parseFloat(value)
                                ])
                            )
                        }
                    };
                    break;
                }
                case "building": {
                    schema.buildings[node.data.label] = {
                        include: true,
                        energy_simulation: node.data.formData.energy_simulation,
                        weather: node.data.formData.weather,
                        carbon_intensity: node.data.formData.carbon_intensity,
                        pricing: node.data.formData.pricing,
                        inactive_observations: node.data.formData.inactive_observations,
                        inactive_actions: node.data.formData.inactive_actions,
                        ...getConnectedDevices(nodes, edges, node.id)
                    };
                }
                default: {
                    break;
                }
            }
        });

        try {
            const body = {
                site: siteName,
                schema: schema
            };

            const response = await fetch("schema/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success('Schema created successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            } else {
                toast.error('Error creating schema!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            }
        } catch (error) {
            toast.error('Error creating schema!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    const getConnectedDevices = (nodes, edges, buildingId) => {
        const typesAttributes = {
            "citylearn.electric_vehicle_charger.Charger": ["nominal_power", "efficiency", "charger_type", "max_charging_power", "min_charging_power", "max_discharging_power", "min_discharging_power", "charge_efficiency_curve", "discharge_efficiency_curve"],
            "citylearn.energy_model.PV": ["nominal_power"],
            "citylearn.energy_model.HeatPump": ["nominal_power", "efficiency", "target_cooling_temperature", "target_heating_temperature"],
            "citylearn.energy_model.ElectricHeater": ["nominal_power", "efficiency"],
            "citylearn.energy_model.StorageTank": ["capacity", "max_output_power", "max_input_power"],
            "citylearn.energy_model.Battery": ["capacity", "nominal_power", "capacity_loss_coefficient", "power_efficiency_curve", "capacity_power_curve", "depth_of_discharge"]
        };

        return edges
            .map((edge) => {
                if (edge.target === buildingId) return nodes.find((n) => n.id === edge.source); // Device → Building
                if (edge.source === buildingId) return nodes.find((n) => n.id === edge.target); // Building → Device
                return null;
            })
            .filter((node) => node && node.data.type !== "building") // Exclude buildings
            .reduce((acc, node) => {
                const { safety_factor, types, selectedType, ...rawFormData } = node.data.formData;

                // Filter out formData keys that are not valid for the selectedType
                const filteredFormData = Object.fromEntries(
                    Object.entries(rawFormData).filter(([key]) => typesAttributes[selectedType].includes(key))
                );

                // Convert numeric values dynamically (for fields that can be numeric)
                const finalFormData = Object.fromEntries(
                    Object.entries(filteredFormData).map(([key, value]) => [
                        key,
                        isNaN(value) ? value : parseFloat(value)
                    ])
                );

                acc[node.data.label.toLowerCase()] = {
                    type: selectedType,
                    autosize: false,
                    ...(safety_factor && {
                        autosize_attributes: { safety_factor: parseFloat(safety_factor) }
                    }),
                    attributes: finalFormData
                };

                return acc;
            }, {});
    };

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);

    // Handle drag start
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    // Handle drop
    const onDrop = (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData("application/reactflow");
        if (!type) return;

        const position = { x: event.clientX - 200, y: event.clientY - 50 };

        let icon, label, formData = {};
        switch (type) {
            case "building":
                icon = <FaBuilding />;
                label = `Building_${nodeCounts.building + 1}`;
                setNodeCounts((prev) => ({ ...prev, building: prev.building + 1 }));
                formData = {
                    energy_simulation: `Building_${nodeCounts.building + 1}.csv`,
                    weather: `weather.csv`,
                    carbon_intensity: `carbon_intensity.csv`,
                    pricing: `pricing.csv`,
                    inactive_observations: [],
                    inactive_actions: []
                };
                break;
            case "ev":
                icon = <FaCar />;
                label = `Electric_Vehicle_${nodeCounts.ev + 1}`;
                setNodeCounts((prev) => ({ ...prev, ev: prev.ev + 1 }));
                formData = {
                    energy_simulation: `Electric_Vehicle_${nodeCounts.ev + 1}.csv`,
                    capacity: 40,
                    nominal_power: 50,
                    initial_soc: 0.25,
                    depth_of_discharge: 0.10
                };
                break;
            case "pv":
                icon = <FaBolt />;
                label = `PV_${nodeCounts.pv + 1}`;
                setNodeCounts((prev) => ({ ...prev, pv: prev.pv + 1 }));
                formData = {
                    types: ["citylearn.energy_model.PV"],
                    selectedType: "citylearn.energy_model.PV",
                    nominal_power: 0.7
                };
                break;
            case "charger":
                icon = <FaPlug />;
                label = `Charger_${nodeCounts.charger + 1}`;
                setNodeCounts((prev) => ({ ...prev, charger: prev.charger + 1 }));
                formData = {
                    types: ["citylearn.electric_vehicle_charger.Charger"],
                    selectedType: "citylearn.electric_vehicle_charger.Charger",
                    nominal_power: 4.1096,
                    efficiency: 0.2535,
                    charger_type: 0,
                    max_charging_power: 11,
                    min_charging_power: 1.4,
                    max_discharging_power: 7.2,
                    min_discharging_power: 0.0,
                    charge_efficiency_curve: [0, 0.8],
                    discharge_efficiency_curve: [0, 0.8]
                };
                break;
            case "cooling_device":
                icon = <FaSnowflake />;
                label = `Cooling_Device_${nodeCounts.cooling_device + 1}`;
                setNodeCounts((prev) => ({ ...prev, cooling_device: prev.cooling_device + 1 }));
                formData = {
                    types: ["citylearn.energy_model.HeatPump"],
                    selectedType: "citylearn.energy_model.HeatPump",
                    safety_factor: 0.5,
                    nominal_power: 2.252523899078369,
                    efficiency: 0.28791926968413395,
                    target_cooling_temperature: 6.016841879471529,
                    target_heating_temperature: 45
                };
                break;
            case "heating_device":
                icon = <FaFireAlt />;
                label = `Heating_Device_${nodeCounts.heating_device + 1}`;
                setNodeCounts((prev) => ({ ...prev, heating_device: prev.heating_device + 1 }));
                formData = {
                    types: ["citylearn.energy_model.HeatPump", "citylearn.energy_model.ElectricHeater"],
                    selectedType: "citylearn.energy_model.HeatPump",
                    safety_factor: 0.5,
                    nominal_power: 2.252523899078369,
                    efficiency: 0.28791926968413395,
                    target_cooling_temperature: 6.016841879471529,
                    target_heating_temperature: 45
                };
                break;
            case "dhw_device":
                icon = <FaFireAlt />;
                label = `DHW_Device_${nodeCounts.dhw_device + 1}`;
                setNodeCounts((prev) => ({ ...prev, dhw_device: prev.dhw_device + 1 }));
                formData = {
                    types: ["citylearn.energy_model.HeatPump", "citylearn.energy_model.ElectricHeater"],
                    selectedType: "citylearn.energy_model.HeatPump",
                    safety_factor: 0.5,
                    nominal_power: 4.109619617462158,
                    efficiency: 0.2535049749071043,
                    target_cooling_temperature: 6.016841879471529,
                    target_heating_temperature: 45
                };
                break;
            case "cooling_storage":
                icon = <FaBox />;
                label = `Cooling_Storage_${nodeCounts.cooling_storage + 1}`;
                setNodeCounts((prev) => ({ ...prev, cooling_storage: prev.cooling_storage + 1 }));
                formData = {
                    types: ["citylearn.energy_model.StorageTank"],
                    selectedType: "citylearn.energy_model.StorageTank",
                    capacity: 2.2826755046844482,
                    max_output_power: 0.003212187876499649,
                    max_input_power: 0.5
                };
                break;
            case "heating_storage":
                icon = <FaBox />;
                label = `Heating_Storage_${nodeCounts.heating_storage + 1}`;
                setNodeCounts((prev) => ({ ...prev, heating_storage: prev.heating_storage + 1 }));
                formData = {
                    types: ["citylearn.energy_model.StorageTank"],
                    selectedType: "citylearn.energy_model.StorageTank",
                    capacity: 2.2826755046844482,
                    max_output_power: 0.003212187876499649,
                    max_input_power: 0.5
                };
                break;
            case "dhw_storage":
                icon = <FaBox />;
                label = `DHW_Storage_${nodeCounts.dhw_storage + 1}`;
                setNodeCounts((prev) => ({ ...prev, dhw_storage: prev.dhw_storage + 1 }));
                formData = {
                    types: ["citylearn.energy_model.StorageTank"],
                    selectedType: "citylearn.energy_model.StorageTank",
                    capacity: 2.2826755046844482,
                    max_output_power: 0.003212187876499649,
                    max_input_power: 0.5
                };
                break;
            case "electrical_storage":
                icon = <FaBox />;
                label = `Electrical_Storage_${nodeCounts.electrical_storage + 1}`;
                setNodeCounts((prev) => ({ ...prev, electrical_storage: prev.electrical_storage + 1 }));
                formData = {
                    types: ["citylearn.energy_model.Battery"],
                    selectedType: "citylearn.energy_model.Battery",
                    capacity: 2.2826755046844482,
                    nominal_power: 0.003212187876499649,
                    capacity_loss_coefficient: 0.5,
                    power_efficiency_curve: [0, 0.8],
                    capacity_power_curve: [0, 0.8],
                    depth_of_discharge: 1
                };
                break;
            default: return;
        }

        const newNode = {
            id: `${nodes.length + 1}`,
            type: "customNode",
            position,
            data: { icon, label, type, formData },
            draggable: true,
        };

        setNodes((prev) => [...prev, newNode]);
    };

    return (
        <>
            <Row>
                <Col className="d-flex justify-content-between align-items-center">
                    <div>
                        {showList &&
                            <h4 className="d-flex align-items-center m-0">{siteList.length} Items Found</h4>
                        }
                    </div>
                    <div>
                        {!showCreate && <Button variant="primary" onClick={() => {
                            setShowList(false);
                            setShowCreate(true);
                        }}>New Schema</Button>}
                        {showCreate && <Button className="mr-2" variant={siteName == "" ? "secondary" : "primary"} onClick={handleSaveSchema}
                            disabled={siteName == ""}>Save Schema</Button>}
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

            {!loading && showList && (siteList.length > 0) && (
                <>
                    <Row className="mt-4">
                        {currentItems.length > 0 &&
                            currentItems.map((site, index) => (
                                <Col md="6" key={index}>
                                    <Card className="mb-2">
                                        <Card.Header className="d-flex justify-content-between py-3">
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedSite(site);
                                                fetchSiteSchema(site);
                                            }}><b>{site}</b></a>
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
                    <Modal size="lg" show={showSiteSchemaModal} onHide={() => setShowSiteSchemaModal(false)}>
                        <div className="py-0 px-3 d-flex align-items-center justify-content-between">
                            <h3>{selectedSite} schema details</h3>
                            <Button variant="danger" type="button" size="xs" onClick={() => setShowSiteSchemaModal(false)}>
                                <i className="fa fa-times"></i>
                            </Button>
                        </div>
                        <Modal.Body style={{
                            height: "50vh",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <textarea
                                value={JSON.stringify(siteSchemaInfo, null, 2)}
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
                </>
            )}

            {showCreate && (
                <>
                    <Row>
                        <Col>
                            <h4>Site Name</h4>
                            <Form.Control className="w-25" type="text" name="site_name" value={siteName} onChange={handleSiteChange} aria-label="Site Name" />
                        </Col>
                    </Row>
                    <h4>Schema Info</h4>
                    <div style={{ display: "flex", paddingTop: 10, height: "80vh" }}>
                        <Sidebar onDragStart={onDragStart} />
                        <div style={{ flexGrow: 1, background: "#fff", border: "1px solid #ddd" }} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
                            <ReactFlow nodes={nodes} onNodesChange={onNodesChange} edges={edges} onEdgesChange={onEdgesChange}
                                onConnect={onConnect} onSelectionChange={handleSelectionChange} fitView nodeTypes={{ customNode: CustomNode }}>
                                <Background />
                                <Controls />
                            </ReactFlow>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}