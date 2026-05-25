import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import { PERMISSIONS } from "./constants/permissions";
import AccessDenied from "./pages/AccessDenied/AccessDenied";
import CoursesForm from "./pages/Courses/CoursesForm";
import CoursesList from "./pages/Courses/CoursesList";
import EnrollmentPeriodsList from "./pages/EnrollmentPeriods/EnrollmentPeriodsList";
import Home from "./pages/Home/Home";
import InstitutionForm from "./pages/Institution/InstitutionForm";
import InstitutionsList from "./pages/Institution/InstitutionsList";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ForgotPasswordSent from "./pages/Login/ForgotPasswordSent";
import Login from "./pages/Login/Login";
import ResetPassword from "./pages/Login/ResetPassword";
import RegionsForm from "./pages/Regions/RegionsForm";
import RegionsList from "./pages/Regions/RegionsList";
import RoomsForm from "./pages/Rooms/RoomsForm";
import RoomsList from "./pages/Rooms/RoomsList";

import Schedule from "./pages/Schedule/Schedule";
import ServiceRoomForm from "./pages/ServiceRooms/ServiceRoomForm";
import ServiceRoomsList from "./pages/ServiceRooms/ServiceRoomsList";
import ServiceForm from "./pages/Services/ServiceForm";
import ServicesList from "./pages/Services/ServicesList";
import ServiceScheduleForm from "./pages/ServiceSchedules/ServiceScheduleForm";
import ServiceScheduleAssignment from "./pages/ServiceSchedules/ServiceScheduleAssignment";
import ServiceSchedulesList from "./pages/ServiceSchedules/ServiceSchedulesList";
import StudentForm from "./pages/Student/StudentForm";
import StudentsList from "./pages/Student/StudentsList";
import UserForm from "./pages/Users/UserForm";
import UsersList from "./pages/Users/UsersList";
import { hasPermission, isAuthenticated } from "./utils/auth";

const ALL_PERMISSIONS = [
  PERMISSIONS.ADMIN,
  PERMISSIONS.INSTITUICAO_ENSINO,
  PERMISSIONS.UNIDADE_SAUDE,
];

const MANAGEMENT_PERMISSIONS = [PERMISSIONS.ADMIN, PERMISSIONS.UNIDADE_SAUDE];

function PrivateRoute({ children, permissions = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!permissions.length) return children;

  if (!hasPermission(permissions)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/sent" element={<ForgotPasswordSent />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:hash" element={<ResetPassword />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Home />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <UsersList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <UserForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <UserForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/institutions"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InstitutionsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/institutions/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InstitutionForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/institutions/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InstitutionForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/regions"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <RegionsList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/regions/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <RegionsForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/regions/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <RegionsForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <CoursesList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <CoursesForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <CoursesForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <RoomsList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <RoomsForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <RoomsForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/:roomId/schedules"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceSchedulesList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/:roomId/schedules/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceScheduleForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/:roomId/schedules/:dayOfWeek/:period"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceScheduleAssignment />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/services"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServicesList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/services/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/services/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/services/:serviceId/rooms"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceRoomsList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/services/:serviceId/rooms/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceRoomForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/service-rooms/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceRoomForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/service-rooms/:roomId/schedules"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceSchedulesList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/service-rooms/:roomId/schedules/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceScheduleForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/service-rooms/:roomId/schedules/:dayOfWeek/:period"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceScheduleAssignment />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/service-schedules/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <ServiceScheduleForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/periods"
        element={
          <PrivateRoute permissions={ALL_PERMISSIONS}>
            <Layout>
              <EnrollmentPeriodsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students"
        element={
          <PrivateRoute permissions={MANAGEMENT_PERMISSIONS}>
            <Layout>
              <StudentsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students/new"
        element={
          <PrivateRoute permissions={MANAGEMENT_PERMISSIONS}>
            <Layout>
              <StudentForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <PrivateRoute permissions={MANAGEMENT_PERMISSIONS}>
            <Layout>
              <StudentForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            permissions={[PERMISSIONS.ADMIN, PERMISSIONS.UNIDADE_SAUDE]}
          >
            <Route
              path="/courses/new"
              element={
                <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
                  <Layout>
                    <CoursesForm />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/courses/:id"
              element={
                <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
                  <Layout>
                    <CoursesForm />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Layout>
              <Schedule />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
