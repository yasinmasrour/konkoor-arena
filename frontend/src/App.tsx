import AppRoutes from "./routes/AppRoutes";
import ScrollProgressBar from "./components/common/ScrollProgressBar";
// import FloatingCTA from "./components/common/FloatingCTA";

function App() {
  return (
    <>
      <ScrollProgressBar />
      <AppRoutes />
      {/* <FloatingCTA /> */}
    </>
  );
}

export default App;
