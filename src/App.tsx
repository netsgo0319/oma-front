import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Loader2 } from "lucide-react"
import AppLayout from "@/layouts/AppLayout"
import { ProjectProvider } from "@/contexts/ProjectContext"
import FeatureGate from "@/components/FeatureGate"

// Lazy-loaded pages
const ProjectList = lazy(() => import("@/pages/ProjectListPage"))
const Dashboard = lazy(() => import("@/pages/dashboard/DashboardPage"))

// DB Migration
const DmsExecution = lazy(() => import("@/pages/db-migration/DmsExecutionPage"))
const DmsResults = lazy(() => import("@/pages/db-migration/DmsResultsPage"))
const AiSchema = lazy(() => import("@/pages/db-migration/AiSchemaPage"))
const SchemaValidation = lazy(() => import("@/pages/db-migration/SchemaValidationPage"))
const ConversionContext = lazy(() => import("@/pages/db-migration/ConversionContextPage"))

// App Migration
const MapperExplorer = lazy(() => import("@/pages/app-migration/MapperExplorerPage"))
const SqlExtraction = lazy(() => import("@/pages/app-migration/SqlExtractionPage"))
const SqlFiltering = lazy(() => import("@/pages/app-migration/SqlFilteringPage"))
const QueryRewrite = lazy(() => import("@/pages/app-migration/QueryRewritePage"))
const ManualReview = lazy(() => import("@/pages/app-migration/ManualReviewPage"))
const XmlMerge = lazy(() => import("@/pages/app-migration/XmlMergePage"))
const TestSupport = lazy(() => import("@/pages/app-migration/TestSupportPage"))

// Data Migration
const DataExecution = lazy(() => import("@/pages/data-migration/DataExecutionPage"))
const DataValidation = lazy(() => import("@/pages/data-migration/DataValidationPage"))

// Tools
const SqlExecutor = lazy(() => import("@/pages/tools/SqlExecutorPage"))
const LogViewerPage = lazy(() => import("@/pages/tools/LogViewerPage"))
const AgentLog = lazy(() => import("@/pages/tools/AgentLogPage"))
const ConversionReport = lazy(() => import("@/pages/tools/ConversionReportPage"))
const KnowledgeBase = lazy(() => import("@/pages/tools/KnowledgeBasePage"))

// Settings
const ProjectSettings = lazy(() => import("@/pages/settings/ProjectSettingsPage"))
const AgentSettings = lazy(() => import("@/pages/settings/AgentSettingsPage"))
const TestSettings = lazy(() => import("@/pages/settings/TestSettingsPage"))
const FeatureManagement = lazy(() => import("@/pages/settings/FeatureManagementPage"))

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function App() {
  return (
    <ProjectProvider>
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Project list (root) */}
          <Route index element={<ProjectList />} />

          {/* Project-scoped routes */}
          <Route path="project/:projectId" element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            {/* DB Migration */}
            <Route path="db-migration/dms-execution" element={<DmsExecution />} />
            <Route path="db-migration/dms-results" element={<DmsResults />} />
            <Route path="db-migration/ai-schema" element={<AiSchema />} />
            <Route path="db-migration/schema-validation" element={<SchemaValidation />} />
            <Route path="db-migration/context" element={<FeatureGate featureKey="conversionContext"><ConversionContext /></FeatureGate>} />

            {/* App Migration */}
            <Route path="app-migration/mapper-explorer" element={<FeatureGate featureKey="mapperExplorer"><MapperExplorer /></FeatureGate>} />
            <Route path="app-migration/sql-extraction" element={<SqlExtraction />} />
            <Route path="app-migration/sql-filtering" element={<SqlFiltering />} />
            <Route path="app-migration/query-rewrite" element={<QueryRewrite />} />
            <Route path="app-migration/manual-review" element={<FeatureGate featureKey="manualReview"><ManualReview /></FeatureGate>} />
            <Route path="app-migration/xml-merge" element={<XmlMerge />} />
            <Route path="app-migration/test-support" element={<FeatureGate featureKey="testSupport"><TestSupport /></FeatureGate>} />

            {/* Data Migration */}
            <Route path="data-migration/execution" element={<DataExecution />} />
            <Route path="data-migration/validation" element={<DataValidation />} />

            {/* Tools */}
            <Route path="tools/sql-executor" element={<FeatureGate featureKey="sqlExecutor"><SqlExecutor /></FeatureGate>} />
            <Route path="tools/log-viewer" element={<FeatureGate featureKey="logViewer"><LogViewerPage /></FeatureGate>} />
            <Route path="tools/agent-log" element={<FeatureGate featureKey="agentLog"><AgentLog /></FeatureGate>} />
            <Route path="tools/report" element={<FeatureGate featureKey="conversionReport"><ConversionReport /></FeatureGate>} />
            <Route path="tools/knowledge-base" element={<FeatureGate featureKey="knowledgeBase"><KnowledgeBase /></FeatureGate>} />

            {/* Settings */}
            <Route path="settings/project" element={<ProjectSettings />} />
            <Route path="settings/agent" element={<AgentSettings />} />
            <Route path="settings/test" element={<TestSettings />} />
            <Route path="settings/features" element={<FeatureManagement />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ProjectProvider>
  )
}

export default App
