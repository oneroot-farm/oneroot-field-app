"use client";

// Icons
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export const TOP_MENU = [
  {
    name: "Dashboard",
    icon: <SpaceDashboardIcon />,
  },
  /*
  {
    name: "Inward",
    icon: <KeyboardDoubleArrowRightIcon />,
  },
  */
];

export const MIDDLE_MENU = [
  /*
  {
    name: "Centers",
    icon: <WarehouseIcon />,
  },
  {
    name: "Outward",
    icon: <KeyboardDoubleArrowLeftIcon />,
  },
  */
];

export const BOTTOM_MENU = [
  /*
  {
    name: "Payments",
    icon: <PaymentsIcon />,
  },
  {
    name: "Users",
    icon: <PeopleIcon />,
  },
  */
];

export const LOWER_MENU = [
  /*
  {
    name: "Logout",
    icon: <ExitToAppIcon />,
  },
  */
];

export const SIDEBAR_MENU = {
  TOP_MENU,
  MIDDLE_MENU,
  BOTTOM_MENU,
};
