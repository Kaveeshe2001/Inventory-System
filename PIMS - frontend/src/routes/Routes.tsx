import React from 'react'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { getDefaultDashboardPath } from '../utils/auth'
import { ToastProvider } from '../context/ToastContext'
import { LoginPage } from '../pages/auth/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout } from '../components/shared/Layout'
import { ItOfficerDashboard } from '../pages/it-officer/ItOfficerDashboard'
import { PensionPointsPage } from '../pages/it-officer/PensionPointsPage'
import { RequestsApprovalPage } from '../pages/inventory/RequestApprovalPage'
import { AssignmentScreenPage } from '../pages/it-officer/AssignmentScreenPage'
import { MaintenanceReviewPage } from '../pages/it-officer/MaintenanceReviewPage'
import { UserManagementPage } from '../pages/it-officer/UserManagementPage'
import { SystemLogsPage } from '../pages/it-officer/SystemLogsPage'
import { StoreDashboard } from '../pages/store/StoreDashboard'
import { IncomingDeliveriesPage } from '../pages/store/IncomingDeliveriesPage'
import { ReturnsPage } from '../pages/store/ReturnsPage'
import { DSOfficeDashboard } from '../pages/ds-office/DSOfficeDashboard'
import { DeviceRequestFormPage } from '../pages/ds-office/DeviceRequestFormPage'
import { MaintenanceRequestFormPage } from '../pages/ds-office/MaintenanceRequestFormPage'
import { ItemListPage } from '../pages/inventory/ItemListPage'
import { CategoriesPage } from '../pages/inventory/CategoriesPage'
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage'
import { NotFoundPage } from '../pages/common/NotFoundPage'
import { SignupPage } from '../pages/auth/SignupPage'


/* =====================================================
   ROOT REDIRECT
   ===================================================== */

const RootRedirect: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Navigate
      to={getDefaultDashboardPath(user.role)}
      replace
    />
  )
}


/* =====================================================
   APPLICATION PROVIDERS
   ===================================================== */

const AppProviders: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  )
}


/* =====================================================
   ROUTER
   ===================================================== */

export const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [

      /* ================================
         PUBLIC ROUTES
         ================================ */

      {
        path: '/login',
        element: <LoginPage />,
      },

      {
        path: '/signup',
        element: <SignupPage />,
      },

      {
        path: '/',
        element: <RootRedirect />,
      },


      /* ================================
         PROTECTED APPLICATION
         ================================ */

      {
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),

        children: [

          /* ================================
             IT OFFICER
             ================================ */

          {
            path: '/it-officer/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['IT_OFFICER']}>
                <ItOfficerDashboard />
              </ProtectedRoute>
            ),
          },

          {
            path: '/it-officer/pension-points',
            element: (
              <ProtectedRoute allowedRoles={['IT_OFFICER']}>
                <PensionPointsPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/it-officer/requests',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'IT_OFFICER',
                  'INVENTORY_MANAGER',
                ]}
              >
                <RequestsApprovalPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/it-officer/assignments',
            element: (
              <ProtectedRoute allowedRoles={['IT_OFFICER']}>
                <AssignmentScreenPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/it-officer/maintenance',
            element: (
              <ProtectedRoute allowedRoles={['IT_OFFICER']}>
                <MaintenanceReviewPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/it-officer/users',
            element: (
              <ProtectedRoute allowedRoles={['IT_OFFICER']}>
                <UserManagementPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/it-officer/logs',
            element: (
              <ProtectedRoute allowedRoles={['IT_OFFICER']}>
                <SystemLogsPage />
              </ProtectedRoute>
            ),
          },


          /* ================================
             STORE
             ================================ */

          {
            path: '/store/dashboard',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'STORE_KEEPER',
                  'INVENTORY_MANAGER',
                  'IT_OFFICER',
                ]}
              >
                <StoreDashboard />
              </ProtectedRoute>
            ),
          },

          {
            path: '/store/deliveries',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'STORE_KEEPER',
                  'INVENTORY_MANAGER',
                  'IT_OFFICER',
                ]}
              >
                <IncomingDeliveriesPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/store/returns',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'STORE_KEEPER',
                  'INVENTORY_MANAGER',
                  'IT_OFFICER',
                  'DS_OFFICER',
                ]}
              >
                <ReturnsPage />
              </ProtectedRoute>
            ),
          },


          /* ================================
             DS OFFICE
             ================================ */

          {
            path: '/ds-office/dashboard',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'DS_OFFICER',
                  'STAFF',
                  'IT_OFFICER',
                ]}
              >
                <DSOfficeDashboard />
              </ProtectedRoute>
            ),
          },

          {
            path: '/ds-office/request-device',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'DS_OFFICER',
                  'STAFF',
                  'IT_OFFICER',
                ]}
              >
                <DeviceRequestFormPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/ds-office/maintenance-request',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'DS_OFFICER',
                  'STAFF',
                  'IT_OFFICER',
                ]}
              >
                <MaintenanceRequestFormPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/ds-office/my-devices',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'DS_OFFICER',
                  'STAFF',
                  'IT_OFFICER',
                ]}
              >
                <DSOfficeDashboard />
              </ProtectedRoute>
            ),
          },

          {
            path: '/ds-office/return-device',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'DS_OFFICER',
                  'STAFF',
                  'IT_OFFICER',
                ]}
              >
                <ReturnsPage />
              </ProtectedRoute>
            ),
          },


          /* ================================
             INVENTORY
             ================================ */

          {
            path: '/inventory/items',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'IT_OFFICER',
                  'STORE_KEEPER',
                  'INVENTORY_MANAGER',
                ]}
              >
                <ItemListPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/inventory/categories',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'IT_OFFICER',
                  'STORE_KEEPER',
                  'INVENTORY_MANAGER',
                ]}
              >
                <CategoriesPage />
              </ProtectedRoute>
            ),
          },

          {
            path: '/inventory/dashboard',
            element: (
              <ProtectedRoute
                allowedRoles={[
                  'STORE_KEEPER',
                  'INVENTORY_MANAGER',
                  'IT_OFFICER',
                ]}
              >
                <StoreDashboard />
              </ProtectedRoute>
            ),
          },


          /* ================================
             COMMON
             ================================ */

          {
            path: '/unauthorized',
            element: <UnauthorizedPage />,
          },

          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
])