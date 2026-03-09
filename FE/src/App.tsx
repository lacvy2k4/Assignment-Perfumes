import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Perfume from './pages/Perfume'
import PerfumeDetail from './pages/PerfumeDetail'
import AdminPerfumeDetail from './pages/AdminPerfumeDetail'
import Brand from './pages/Brand'
import BrandDetail from './pages/BrandDetail'
import Collector from './pages/Collector'
import Error from './pages/Error'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <BrowserRouter>
      {/* Bao bọc toàn bộ web với min-h-screen và flex-col để đẩy Footer xuống đáy */}
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <Toaster position="top-right" />
        <Navbar />

        {/* Phần content chính sẽ fill out space bằng flex-grow */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/perfumes/name/:perfumeName" element={<PerfumeDetail />} />

            {/* Authenticated User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/perfumes" element={<Perfume />} />
              <Route path="/perfumes/:id" element={<AdminPerfumeDetail />} />
              <Route path="/brands" element={<Brand />} />
              <Route path="/brands/:id" element={<BrandDetail />} />
              <Route path="/collectors" element={<Collector />} />
            </Route>

            <Route path="*" element={<Error />} />
          </Routes>
        </main>


        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
