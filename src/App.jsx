import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import TripResult from "./pages/TripResult";
import { useState } from "react";

const AppRoutes = () => {
  const [planRequest, setPlanRequest] = useState(null);
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home onGenerate={(req) => { setPlanRequest(req); navigate("/plan"); }} />} />
      <Route path="/plan" element={<TripResult planRequest={planRequest} />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
