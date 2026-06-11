import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import { PERMISSIONS } from "./constants/permissions";
import AccessDenied from "./pages/AccessDenied/AccessDenied";
import DisciplinesForm from "./pages/Discipline/DisciplineForm";
import DisciplinesList from "./pages/Discipline/DisciplineList";
import EnrollmentManageInstitution from "./pages/EnrollmentPeriods/EnrollmentManageInstitution";
import EnrollmentPeriodsForm from "./pages/EnrollmentPeriods/EnrollmentPeriodsForm";
import EnrollmentPeriodsHistory from "./pages/EnrollmentPeriods/EnrollmentPeriodsHistory";
import EnrollmentPeriodsList from "./pages/EnrollmentPeriods/EnrollmentPeriodsList";
import EnrollmentPeriodsManage from "./pages/EnrollmentPeriods/EnrollmentPeriodsManage";
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

import InternshipsForm from "./pages/Internships/InternshipsForm";
import InternshipsLinkStudents from "./pages/Internships/InternshipsLinkStudents";
import InternshipsList from "./pages/Internships/InternshipsList";
import InternshipsRoomForm from "./pages/InternshipsRooms/InternshipsRoomForm";
import InternshipsRoomsList from "./pages/InternshipsRooms/InternshipsRoomsList";
import InternshipsScheduleAssignment from "./pages/InternshipsSchedules/InternshipsScheduleAssignment";
import InternshipsScheduleForm from "./pages/InternshipsSchedules/InternshipsScheduleForm";
import InternshipsListSchedulesList from "./pages/InternshipsSchedules/InternshipsSchedulesList";

import StudentDetails from "./pages/Student/StudentDetails";
import StudentForm from "./pages/Student/StudentForm";
import StudentHistory from "./pages/Student/StudentHistory";
import StudentsList from "./pages/Student/StudentsList";
import UserForm from "./pages/Users/UserForm";
import UsersList from "./pages/Users/UsersList";
import { hasPermission, isAuthenticated } from "./utils/auth";

const ALL_PERMISSIONS = [
  PERMISSIONS.ADMIN,
  PERMISSIONS.INSTITUICAO_ENSINO,
  PERMISSIONS.CAMPO_ESTAGIO,
];

const MANAGEMENT_PERMISSIONS = [PERMISSIONS.ADMIN, PERMISSIONS.INSTITUICAO_ENSINO, PERMISSIONS.CAMPO_ESTAGIO];

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
        path="/disciplines"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <DisciplinesList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/disciplines/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <DisciplinesForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/disciplines/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <DisciplinesForm />
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
        path="/rooms/schedules"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsListSchedulesList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/history"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <EnrollmentPeriodsHistory />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/schedules/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsScheduleForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/schedules/assignment"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsScheduleAssignment />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms/schedules/history"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <EnrollmentPeriodsHistory />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships/link-students"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO]}>
            <Layout>
              <InternshipsLinkStudents />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships/rooms"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsRoomsList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships/rooms/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsRoomForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships/rooms/edit"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsRoomForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships-rooms/schedules"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsListSchedulesList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships-rooms/history"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <EnrollmentPeriodsHistory />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships-rooms/schedules/new"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsScheduleForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships-rooms/schedules/assignment"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsScheduleAssignment />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships-rooms/schedules/history"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <EnrollmentPeriodsHistory />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships-schedules/:id"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <InternshipsScheduleForm />
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
        path="/periods/new"
        element={
          <PrivateRoute permissions={ALL_PERMISSIONS}>
            <Layout>
              <EnrollmentPeriodsForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/periods/:id"
        element={
          <PrivateRoute permissions={ALL_PERMISSIONS}>
            <Layout>
              <EnrollmentPeriodsForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/periods/manage"
        element={
          <PrivateRoute permissions={[PERMISSIONS.ADMIN]}>
            <Layout>
              <EnrollmentPeriodsManage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/periods/history"
        element={
          <PrivateRoute permissions={ALL_PERMISSIONS}>
            <Layout>
              <EnrollmentPeriodsHistory />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/periods/manage-institution"
        element={
          <PrivateRoute permissions={[PERMISSIONS.INSTITUICAO_ENSINO]}>
            <Layout>
              <EnrollmentManageInstitution />
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
        path="/students/details"
        element={
          <PrivateRoute permissions={MANAGEMENT_PERMISSIONS}>
            <Layout>
              <StudentDetails />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/students/history"
        element={
          <PrivateRoute permissions={MANAGEMENT_PERMISSIONS}>
            <Layout>
              <StudentHistory />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            permissions={[PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO]}
          >
            <Layout>
              <Schedule />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
