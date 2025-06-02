/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import RecDashboard from "pages/dashboard-page/RecDashboard.js";
import UseCases from "pages/use-cases-page/UseCases.js";
import KPIs from "pages/kpis-page/KPIs.js";
import Maps from "pages/map-page/Maps.js";
import SimualtionListPage from "pages/simulation-list-page/SimualtionListPage.js";
import DatasetsPage from "pages/datasets-page/DatasetsPage.js";
import SchemaPage from "pages/schema-page/SchemaPage.js";
import ExperimentConfigsPage from "pages/experiment-configs-page/ExperimentConfigsPage.js";
import RunSimulations from "pages/run-simulations-page/RunSimulations";

const dashboardRoutes = [
  {
    path: "/rec-dashboard",
    name: "REC Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: RecDashboard,
    layout: "/admin",
    userType: "ai-engineer"
  },
  {
    path: "/kpis",
    name: "KPIs",
    icon: "nc-icon nc-notes",
    component: KPIs,
    layout: "/admin",
    userType: "ai-engineer"
  },
  // {
  //   path: "/maps",
  //   name: "Map",
  //   icon: "nc-icon nc-pin-3",
  //   component: Maps,
  //   layout: "/admin",
  //   userType: "ai-engineer"
  // },
  // {
  //   path: "/simulation-list",
  //   name: "Simulations",
  //   icon: "nc-icon nc-paper-2",
  //   component: SimualtionListPage,
  //   layout: "/admin",
  //   userType: "ai-engineer"
  // },
  {
    path: "/run-simulations",
    name: "Run Simulations",
    icon: "nc-icon nc-button-play",
    component: RunSimulations,
    layout: "/admin",
    userType: "ai-engineer"
  },
  {
    path: "/datasets",
    name: "Datasets",
    icon: "nc-icon nc-single-copy-04",
    component: DatasetsPage,
    layout: "/admin",
    userType: "ai-engineer"
  },
  {
    path: "/configs",
    name: "Experiment Configs",
    icon: "nc-icon nc-settings-gear-64",
    component: ExperimentConfigsPage,
    layout: "/admin",
    userType: "ai-engineer"
  },
  {
    path: "/use-cases",
    name: "Use Cases",
    icon: "nc-icon nc-chart-pie-35",
    component: UseCases,
    layout: "/admin",
    userType: "rec-manager"
  },
  {
    path: "/schema",
    name: "Schema",
    icon: "nc-icon nc-puzzle-10",
    component: SchemaPage,
    layout: "/admin",
    userType: "rec-manager"
  },
];

export default dashboardRoutes;
