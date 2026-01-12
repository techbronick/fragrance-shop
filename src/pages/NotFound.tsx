import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Pagină negăsită</h2>
          <p className="text-gray-600 mb-8">
            Ne pare rău, pagina pe care o căutați nu există.
          </p>
          <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
            Întoarcete-te la pagina principală
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
