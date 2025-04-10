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
import Dashboard from "pages/dashboard-2-page/Dashboard.js";
import KPIs from "pages/kpis-page/KPIs.js";
import Maps from "pages/map-page/Maps.js";
import SimualtionListPage from "pages/simulation-list-page/SimualtionListPage.js";
import SchemaPage from "pages/schema-page/SchemaPage.js";

const dashboardRoutes = [
  // {
  //   upgrade: true,
  //   path: "/upgrade",
  //   name: "Upgrade to PRO",
  //   icon: "nc-icon nc-alien-33",
  //   component: Upgrade,
  //   layout: "/admin"
  // },
  {
    path: "/rec-dashboard",
    name: "REC Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: RecDashboard,
    layout: "/admin"
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/kpis",
    name: "KPIs",
    icon: "nc-icon nc-notes",
    component: KPIs,
    layout: "/admin"
  },
  {
    path: "/maps",
    name: "Map",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/admin"
  },
  {
    path: "/simulation-list",
    name: "Simulations",
    icon: "nc-icon nc-paper-2",
    component: SimualtionListPage,
    layout: "/admin"
  },
  {
    path: "/schema",
    name: "Schema",
    icon: "nc-icon nc-puzzle-10",
    component: SchemaPage,
    layout: "/admin"
  }
];

export default dashboardRoutes;
