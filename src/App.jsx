import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import CoursesList from "./pages/Courses/CoursesList";
import EnrollmentPeriods from "./pages/EnrollmentPeriods/EnrollmentPeriods";
import HealthUnitForm from "./pages/HealthUnit/HealthUnitForm";
import HealthUnitsList from "./pages/HealthUnit/HealthUnitsList";
import Home from "./pages/Home/Home";
import InstitutionForm from "./pages/Institution/InstitutionForm";
import InstitutionsList from "./pages/Institution/InstitutionsList";
import InternshipForm from "./pages/Institution/InternshipForm";
import InternshipList from "./pages/Internship/InternshipList";
import RoomsList from "./pages/Rooms/RoomsList";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ForgotPasswordSent from "./pages/Login/ForgotPasswordSent";
import ResetPassword from "./pages/Login/ResetPassword";
import RegionsList from "./pages/Regions/RegionsList";
import Agenda from "./pages/Schedule/Schedule";
import StudentForm from "./pages/StudentForm";
import StudentsList from "./pages/StudentsList";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/sent" element={<ForgotPasswordSent />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:hash" element={<ResetPassword />} />

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
        path="/units"
        element={
          <PrivateRoute>
            <Layout>
              <HealthUnitsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/units/new"
        element={
          <PrivateRoute>
            <Layout>
              <HealthUnitForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/units/:id"
        element={
          <PrivateRoute>
            <Layout>
              <HealthUnitForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/institutions"
        element={
          <PrivateRoute>
            <Layout>
              <InstitutionsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/institutions/new"
        element={
          <PrivateRoute>
            <Layout>
              <InstitutionForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/regions"
        element={
          <PrivateRoute>
            <Layout>
              <RegionsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <Layout>
              <CoursesList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <PrivateRoute>
            <Layout>
              <RoomsList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/periods"
        element={
          <PrivateRoute>
            <Layout>
              <EnrollmentPeriods />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students"
        element={
          <PrivateRoute>
            <Layout>
              <StudentsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students/new"
        element={
          <PrivateRoute>
            <Layout>
              <StudentForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <PrivateRoute>
            <Layout>
              <StudentForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/internships"
        element={
          <PrivateRoute>
            <Layout>
              <InternshipList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/internships/new"
        element={
          <PrivateRoute>
            <Layout>
              <InternshipForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Agenda />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
