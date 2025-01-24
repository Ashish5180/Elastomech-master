import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronsRight, FiHome } from "react-icons/fi";
import { MdDashboard, MdOutlineInventory, MdInventory2 } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { CiBoxList } from "react-icons/ci";
import { SlChemistry } from "react-icons/sl";
import { GrVirtualMachine } from "react-icons/gr";
import { SlNotebook } from "react-icons/sl";
import { SiGooglecloudstorage } from "react-icons/si";
import { SiVault } from "react-icons/si";
import { motion } from "framer-motion";

const Sidebar = ({ children, role }) => {
  return (
    <div className="flex h-screen bg-indigo-50">
      {/* Sidebar */}
      <Sidebar2 role={role} />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</div>
    </div>
  );
};

export default Sidebar;

const Sidebar2 = ({ role }) => {
  const [open, setOpen] = useState(true);
  const location = useLocation(); // To get the current location
  const navigate = useNavigate(); // To handle navigation

  // Links based on role...
  const links =
    role === "admin"
      ? [
          { name: "Dashboard", Icon: MdDashboard, path: "/admin" },
          { name: "Orders", Icon: FaBoxOpen, path: "/admin/orders" },
          { name: "Add Order", Icon: CiBoxList, path: "/admin/add-order" },
          {
            name: "Raw Material Inventory",
            Icon: MdOutlineInventory,
            path: "/admin/inventory",
          },
          {
            name: "Record Raw Material Inward/Outward",
            Icon: SiGooglecloudstorage,
            path: "/admin/inventorylogging",
          },

          {
            name: "Formula Bin",
            Icon: SlChemistry,
            path: "/admin/formula-bin",
          },
          {
            name: "Record Mixing",
            Icon: MdInventory2,
            path: "/admin/formulaInventory",
          },
       

          { name: "Product Bin", Icon: SiVault, path: "/admin/productBin" },
          {
            name: "Record Moulding",
            Icon: SiVault,
            path: "/admin/productInventory",
          },
          { name: "NotePad", Icon: SlNotebook, path: "/admin/board" },
        ]
      :[
        { name: "Dashboard", Icon: MdDashboard, path: "/admin" },
        { name: "Orders", Icon: FaBoxOpen, path: "/admin/orders" },
        { name: "Add Order", Icon: CiBoxList, path: "/admin/add-order" },
        {
          name: "Raw Material Inventory",
          Icon: MdOutlineInventory,
          path: "/worker/inventory",
        },
        {
          name: "Record Raw Material Inward/Outward",
          Icon: SiGooglecloudstorage,
          path: "/admin/inventorylogging",
        },

        {
          name: "Formula Bin",
          Icon: SlChemistry,
          path: "/admin/formula-bin",
        },
        {
          name: "Record Mixing",
          Icon: MdInventory2,
          path: "/admin/formulaInventory",
        },
     

        { name: "Product Bin", Icon: SiVault, path: "/admin/productBin" },
        {
          name: "Record Moulding",
          Icon: SiVault,
          path: "/admin/productInventory",
        },
        { name: "NotePad", Icon: SlNotebook, path: "/admin/board" },
      ]

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen border-r border-slate-300 bg-white p-2"
      style={{
        width: open ? "225px" : "64px", // Sidebar width based on open state
      }}
    >
      <TitleSection open={open} />
      <div className="space-y-1">
        {links.map((link) => (
          <Option
            key={link.name}
            Icon={link.Icon}
            title={link.name}
            path={link.path}
            selected={location.pathname === link.path} // Compare pathname to highlight the selected link
            open={open}
          />
        ))}
      </div>
      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, path, selected, open }) => {
  return (
    <Link to={path} className="w-full">
      <motion.button
        layout
        className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
          selected
            ? "bg-indigo-100 text-indigo-800"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <motion.div
          layout
          className="grid h-full w-10 place-content-center text-lg"
        >
          <Icon />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            {title}
          </motion.span>
        )}
      </motion.button>
    </Link>
  );
};

const TitleSection = ({ open }) => {
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold">ElastoMech</span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600"
    >
      <FiHome className="text-white text-lg" />
    </motion.div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((prev) => !prev)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg"
        >
          <FiChevronsRight
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};
