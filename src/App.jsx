// import { useState } from 'react'
// import './App.css'
// import Login from './auth/Login'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import MainLayout from './Layout/MainLayout'
// import Dashboard from './Pages/Dashboard'
// import ProtectedRoute from './routes/ProtectedRoute'
// import ListCustomer from './Pages/Customer/List_Customer'
// import CreateCustomer from './Pages/Customer/Create_Customer'
// import ListInvoice from './Pages/Invoice/List_Invoice'
// import CreateInvoice from './Pages/Invoice/Create_Invoice'
// import InvoiceById from './Pages/Invoice/InvoiceById'
// import Department from './Pages/department/Department'
// import ListRoom from './Pages/Stays/Rooms/List_Room'
// import CreateRoom from './Pages/Stays/Rooms/Create_Room'
// import ListBookings from './Pages/Stays/All-Reservation/List_Bookings'
// import CustomerProfile from "./Pages/Customer/Customer_Profile";
// import EditCustomer from "./Pages/Customer/Edit_Customer";
// import Preview from './Pages/Invoice/Preview'
// import CustomerInvoiceView from './Pages/Invoice/CustomerInvoiceView'
// import NetworkStatus from './components/NetworkStatus'
// import AccessManagementPage from './Pages/AccessManagement/AccessManagementPage'
// import CreateAccessUser from './Pages/AccessManagement/CreateAccessUser'
// import UserAccessDetails from './Pages/AccessManagement/UserAccessDetails'
// import AuditLogsPage from './Pages/AuditLogs/AuditLogsPage'
// import UserAuditLogs from './Pages/AuditLogs/UserAuditLogs'
// import AuditReportPreview from './Pages/AuditLogs/AuditReportPreview'
// import { AccessProvider } from './services/AccessContext'  // adjust path
// import RequireModule from './services/RequireModule'

// function App() {
//   return (
//     <BrowserRouter>
//     <NetworkStatus />
//       <Routes>
//         <Route path="/login" element={<Login />} />

//         <Route
//           element={
//             <ProtectedRoute>
//               <MainLayout />
//             </ProtectedRoute>
//           }
//         >

//           <Route path="/" element={<Dashboard />} />
//           <Route path="/customers" element={<ListCustomer />} />
//           <Route path="/customers/create" element={<CreateCustomer />} />
//           <Route path="/customers/edit/:id" element={<EditCustomer />} />
//           <Route path="/invoices" element={<ListInvoice />} />
//           <Route path="/invoices/create" element={<CreateInvoice />} />
//           <Route path="/invoices/:id/edit" element={<CreateInvoice />} />

//           <Route path="/invoices/:id" element={<InvoiceById />} />
//           <Route path="/departments" element={<Department />} />
//           <Route path="/stays/rooms" element={<ListRoom />} />
//           <Route path="/stays/rooms/create" element={<CreateRoom />} />
//           <Route path="/stays/reservations" element={<ListBookings />} />
//           <Route path="/customers/:id" element={<CustomerProfile />} />
         
//           {/* Access Management & Audit Logs Routes */}
//           <Route path="/access-management" element={<AccessManagementPage />} />
//           <Route path="/access-management/create" element={<CreateAccessUser />} />
//           <Route path="/access-management/edit/:id" element={<CreateAccessUser />} />
//           <Route path="/access-management/:id" element={<UserAccessDetails />} />
//           <Route path="/audit-logs" element={<AuditLogsPage />} />
//           <Route path="/audit-logs/user/:userId" element={<UserAuditLogs />} />
//           <Route path="/audit-logs/report-preview" element={<AuditReportPreview />} />
         
//           {/* add customers, invoices, reports, users, settings routes here later */}
//         </Route>
//             <Route path="/invoices/report-preview" element={<Preview />} />    
//              <Route path="/invoice/view/:invoice_number" element={<CustomerInvoiceView />} />  
//       </Routes>
//       <NetworkStatus />
//     </BrowserRouter>
//   )
// }

// export default App





import './App.css'
import Login from './auth/Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './Layout/MainLayout'
import Dashboard from './Pages/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import PropertyOverview from './Pages/PropertyRooms/PropertyOverview'
import PropertyDetailsView from './Pages/PropertyRooms/PropertyDetailsView'
import PropertyRoomsBoard from './Pages/PropertyRooms/PropertyRoomsBoard'
import PropertyManagementV2Overview from './Pages/PropertyManagementV2/PropertyManagementV2Overview'
import PropertyManagementV2Details from './Pages/PropertyManagementV2/PropertyManagementV2Details'
import PropertyManagementV2Rooms from './Pages/PropertyManagementV2/PropertyManagementV2Rooms'
import ListCustomer from './Pages/Customer/List_Customer'
import CreateCustomer from './Pages/Customer/Create_Customer'
import ListInvoice from './Pages/Invoice/List_Invoice'
import CreateInvoice from './Pages/Invoice/Create_Invoice'
import InvoiceById from './Pages/Invoice/InvoiceById'
import Department from './Pages/department/Department'
import ListRoom from './Pages/Stays/Rooms/List_Room'
import CreateRoom from './Pages/Stays/Rooms/Create_Room'
import ListBookings from './Pages/Stays/All-Reservation/List_Bookings'
import CustomerProfile from "./Pages/Customer/Customer_Profile";
import EditCustomer from "./Pages/Customer/Edit_Customer";
import Preview from './Pages/Invoice/Preview'
import CustomerInvoiceView from './Pages/Invoice/CustomerInvoiceView'
import NetworkStatus from './components/NetworkStatus'
import AccessManagementPage from './Pages/AccessManagement/AccessManagementPage'
import CreateAccessUser from './Pages/AccessManagement/CreateAccessUser'
import UserAccessDetails from './Pages/AccessManagement/UserAccessDetails'
import AuditLogsPage from './Pages/AuditLogs/AuditLogsPage'
import UserAuditLogs from './Pages/AuditLogs/UserAuditLogs'
import AuditReportPreview from './Pages/AuditLogs/AuditReportPreview'
import { AccessProvider } from './services/AccessContext'
import RequireModule from './services/RequireModule'
import PropertyManagementV2BookingDetails from './Pages/PropertyManagementV2/PropertyManagementV2BookingDetails'
import CreateRoomInvoice from './Pages/Invoice/Create_Room_Invoice'
import NotFound from './Pages/NotFound'


const guard = (module, element, action = "view") => (
  <RequireModule module={module} action={action}>{element}</RequireModule>
)

function App() {
  return (
    <BrowserRouter>
      <AccessProvider>
        <NetworkStatus />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />

            {/* Room & Bookings / Properties (Stitch Flow) */}
            <Route path="/rooms-bookings" element={<PropertyOverview />} />
            <Route path="/rooms-bookings/property/:propertyId" element={<PropertyDetailsView />} />
            <Route path="/rooms-bookings/property/:propertyId/rooms" element={<PropertyRoomsBoard />} />

            {/* Direct /properties aliases */}
            <Route path="/properties" element={<PropertyOverview />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailsView />} />
            <Route path="/properties/:propertyId/rooms" element={<PropertyRoomsBoard />} />
<Route
  path="/property-management-v2/bookings"
  element={guard("room_booking", <PropertyManagementV2BookingDetails />)}
/>
            {/* Property Management V2 */}
            <Route
              path="/property-management-v2"
                             element={guard("room_booking", <PropertyManagementV2Overview />)}
              />
            <Route
              path="/property-management-v2/property/:propertyId"
              element={guard("room_booking", <PropertyManagementV2Details />)}
            />
            <Route
              path="/property-management-v2/property/:propertyId/rooms"
              element={guard("room_booking", <PropertyManagementV2Rooms />)}
            />

            {/* Customers */}
            <Route path="/customers" element={guard("customers", <ListCustomer />)} />
            
<Route path="/customers/create" element={guard("customers", <CreateCustomer />, "create")} />
<Route path="/customers/edit/:id" element={guard("customers", <EditCustomer />, "update")} />
            <Route path="/customers/:id" element={guard("customers", <CustomerProfile />)} />

            {/* Invoices */}
            <Route path="/invoices" element={guard("invoice", <ListInvoice />)} />
<Route path="/invoices/create" element={guard("invoice", <CreateInvoice />, "create")} />
<Route path="/invoices/:id/edit" element={guard("invoice", <CreateInvoice />, "update")} />
<Route path="/invoices/room-create" element={guard("invoice", <CreateRoomInvoice />, "create")} />
            <Route path="/invoices/:id" element={guard("invoice", <InvoiceById />)} />

            {/* Departments */}
            <Route path="/departments" element={guard("departments", <Department />)} />

            {/* Stays */}
            <Route path="/stays/rooms" element={<ListRoom />} />
            <Route path="/stays/rooms/create" element={<CreateRoom />} />
            <Route path="/stays/reservations" element={<ListBookings />} />

            {/* Access Management & Audit Logs */}
            <Route path="/access-management" element={guard("access_management", <AccessManagementPage />)} />
           <Route path="/access-management/create" element={guard("access_management", <CreateAccessUser />, "create")} />
<Route path="/access-management/edit/:id" element={guard("access_management", <CreateAccessUser />, "update")} />
            <Route path="/access-management/:id" element={guard("access_management", <UserAccessDetails />)} />
<Route path="/audit-logs" element={guard("audit_logs", <AuditLogsPage />)} />
<Route path="/audit-logs/user/:userId" element={guard("audit_logs", <UserAuditLogs />)} />
<Route path="/audit-logs/report-preview" element={guard("audit_logs", <AuditReportPreview />, "export")} />
          </Route>

          <Route path="/invoices/report-preview" element={<Preview />} />
          <Route path="/invoice/view/:invoice_number" element={<CustomerInvoiceView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AccessProvider>
    </BrowserRouter>
  )
}

export default App