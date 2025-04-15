import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Calculator from "@/components/calculator";
import LicenseOptions from "@/components/license-options";
import HourOptions from "@/components/hour-options";
import SummaryTable from "@/components/summary-table";
import { useAuth } from "@/hooks/use-auth";
import { FinancingTerm, HourPackage } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

type LicenseOption = {
  id: string;
  type: "cash" | "financed";
  months?: number;
  rate?: number;
  total: number;
  monthly?: number;
};

type HourOption = {
  id: string;
  packageId: number;
  packageName: string;
  hours: number;
  type: "cash" | "financed";
  months?: number;
  rate?: number;
  total: number;
  monthly?: number;
};

export default function HomePage() {
  const { user } = useAuth();
  const [calculator, setCalculator] = useState({
    licenseQty: '',
    licensePrice: '',
  });
  const [showResults, setShowResults] = useState(false);
  const [selectedLicenseOption, setSelectedLicenseOption] = useState<string | null>(null);
  const [selectedHourOption, setSelectedHourOption] = useState<string | null>(null);
  const [licenseOptions, setLicenseOptions] = useState<LicenseOption[]>([]);
  const [hourOptions, setHourOptions] = useState<HourOption[]>([]);

  // Fetch financing terms
  const { data: financingTerms = [] } = useQuery<FinancingTerm[]>({
    queryKey: ["/api/financing-terms"],
  });

  // Fetch hour packages
  const { data: hourPackages = [] } = useQuery<HourPackage[]>({
    queryKey: ["/api/hour-packages"],
  });

  const calculateOptions = () => {
    const { licenseQty, licensePrice } = calculator;
    
    if (licenseQty <= 0 || licensePrice <= 0) {
      setShowResults(false);
      return;
    }

    // Calculate cash option for licenses
    const totalCash = licenseQty * licensePrice;
    
    // Create license options
    const newLicenseOptions: LicenseOption[] = [
      {
        id: "cash",
        type: "cash",
        total: totalCash,
      },
    ];

    // Add financed options for licenses
    financingTerms.forEach((term, index) => {
      const rate = term.rate / 100;
      const totalFinanced = totalCash * (1 + rate);
      const monthly = totalFinanced / term.months;
      
      newLicenseOptions.push({
        id: `financed-${index}`,
        type: "financed",
        months: term.months,
        rate: term.rate,
        total: totalFinanced,
        monthly,
      });
    });

    // Create hour package options
    const newHourOptions: HourOption[] = [];
    
    hourPackages.forEach((pkg, pkgIndex) => {
      // Cash option
      newHourOptions.push({
        id: `pkg-${pkgIndex}-cash`,
        packageId: pkg.id,
        packageName: pkg.name,
        hours: pkg.hours,
        type: "cash",
        total: pkg.price,
      });
      
      // Financed options
      financingTerms.forEach((term, termIndex) => {
        const rate = term.rate / 100;
        const totalFinanced = pkg.price * (1 + rate);
        const monthly = totalFinanced / term.months;
        
        newHourOptions.push({
          id: `pkg-${pkgIndex}-financed-${termIndex}`,
          packageId: pkg.id,
          packageName: pkg.name,
          hours: pkg.hours,
          type: "financed",
          months: term.months,
          rate: term.rate,
          total: totalFinanced,
          monthly,
        });
      });
    });

    setLicenseOptions(newLicenseOptions);
    setHourOptions(newHourOptions);
    setShowResults(true);
    setSelectedLicenseOption(null);
    setSelectedHourOption(null);
  };

  const handleCalculatorChange = (key: string, value: number) => {
    setCalculator(prev => ({ ...prev, [key]: value }));
  };

  const handleLicenseOptionSelect = (optionId: string) => {
    setSelectedLicenseOption(optionId);
  };

  const handleHourOptionSelect = (optionId: string) => {
    setSelectedHourOption(optionId);
  };

  const getSelectedLicenseOption = () => {
    if (!selectedLicenseOption) return null;
    return licenseOptions.find(option => option.id === selectedLicenseOption) || null;
  };

  const getSelectedHourOption = () => {
    if (!selectedHourOption) return null;
    return hourOptions.find(option => option.id === selectedHourOption) || null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {user?.isAdmin && <Sidebar activeItem={null} />}
        
        <main className="flex-1 p-6 overflow-auto bg-neutral-100">
          <div className="space-y-6">
            <Calculator 
              calculator={calculator}
              onChange={handleCalculatorChange}
              onCalculate={calculateOptions}
            />
            
            {showResults && (
              <>
                <LicenseOptions 
                  options={licenseOptions}
                  selectedOption={selectedLicenseOption}
                  onSelect={handleLicenseOptionSelect}
                />
                
                <HourOptions 
                  options={hourOptions}
                  selectedOption={selectedHourOption}
                  onSelect={handleHourOptionSelect}
                />
                
                {selectedLicenseOption && selectedHourOption && (
                  <SummaryTable 
                    licenseQty={calculator.licenseQty}
                    licensePrice={calculator.licensePrice}
                    licenseOption={getSelectedLicenseOption()!}
                    hourOption={getSelectedHourOption()!}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
