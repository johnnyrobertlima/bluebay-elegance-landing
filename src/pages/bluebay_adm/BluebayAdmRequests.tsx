
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";

const BluebayAdmRequests = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Solicitações Bluebay</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-lg text-gray-700">
              Gerenciamento de solicitações em desenvolvimento.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmRequests;
