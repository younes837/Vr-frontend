"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableVisible, setTableVisible] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [dataDetails, setDataDetails] = useState(null);
  const [expandedTable, setExpandedTable] = useState(false);
  const [percentageInput, setPercentageInput] = useState("");

  // Data structure with NB and their KMS ranges
  const nbRanges = {
    12: { start: 40000, end: 200000 },
    18: { start: 40000, end: 200000 },
    24: { start: 40000, end: 250000 },
    30: { start: 40000, end: 250000 },
    36: { start: 40000, end: 250000 },
    48: { start: 40000, end: 250000 },
    60: { start: 40000, end: 250000 },
  };

  // Initial data with specific values
  const initialData = [
    { nb: "12", kms: "40000", vr: "" },
    { nb: "24", kms: "80000", vr: "" },
    { nb: "48", kms: "160000", vr: "" },
    { nb: "60", kms: "200000", vr: "" },
  ];

  // Static data for when detail data is empty
  const [staticData, setStaticData] = useState(initialData);
  const [calculatedData, setCalculatedData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3005/api/search_vr?search=${search}`
      );
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataDetails = async (key) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3005/api/search_vr_detail?code_vr=${key}`
      );
      const data = await res.json();
      console.log(data);

      setDataDetails(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleEyeClick = (key) => {
    setSelectedKey(key);
    setTableVisible(!tableVisible);
    fetchDataDetails(key);
  };

  const handleVrChange = (index, value) => {
    const newData = [...staticData];
    newData[index].vr = value;
    setStaticData(newData);
  };

  const calculateVr = () => {
    console.log("Calculating VR values...");

    // Check if all VR inputs are filled
    const allFilled = staticData.every((item) => item.vr.trim() !== "");

    if (!allFilled) {
      alert("Please fill in all VR values first");
      return;
    }

    // Extract VR values for the initial NB values
    const vrValues = {};
    staticData.forEach((item) => {
      vrValues[item.nb] = parseFloat(item.vr);
    });

    // Calculate the decrements per 10K KMS for each NB range
    const decrements = {
      "12-24": (vrValues["12"] - vrValues["24"]) / 37, // (VR of 12 - VR of 24) / 37
      "24-48": (vrValues["24"] - vrValues["48"]) / 47, // (VR of 24 - VR of 48) / 47
      "48-60": (vrValues["48"] - vrValues["60"]) / 25, // (VR of 48 - VR of 60) / 25
    };

    // All NB values that need to be calculated
    const nbToCalculate = ["12", "18", "24", "30", "36", "48", "60"];

    // Generate complete data set with appropriate sorting
    const expanded = [];

    // First, add all initial data points to ensure they remain unchanged
    staticData.forEach((item) => {
      expanded.push({
        nb: item.nb,
        kms: item.kms,
        vr: parseFloat(item.vr),
        isInitial: true,
      });
    });

    // Calculate all end points for each NB range
    const endPoints = {};

    // For NB 12, calculate all points including the end point (200000)
    let nb12EndVr = null;
    const decrement12 = decrements["12-24"];
    let current12Vr = vrValues["12"];

    for (
      let kms = parseInt(staticData[0].kms) + 10000;
      kms <= nbRanges[12].end;
      kms += 10000
    ) {
      current12Vr = current12Vr - decrement12;

      expanded.push({
        nb: "12",
        kms: kms.toString(),
        vr: current12Vr,
        isInitial: false,
      });

      if (kms === nbRanges[12].end) {
        nb12EndVr = current12Vr;
        endPoints["12"] = { kms: kms, vr: current12Vr };
      }
    }

    // For NB 24, calculate all points including the end point (250000)
    let nb24EndVr = null;
    const decrement24 = decrements["24-48"];
    let current24Vr = vrValues["24"];

    for (
      let kms = parseInt(staticData[1].kms) + 10000;
      kms <= nbRanges[24].end;
      kms += 10000
    ) {
      current24Vr = current24Vr - decrement24;

      expanded.push({
        nb: "24",
        kms: kms.toString(),
        vr: current24Vr,
        isInitial: false,
      });

      if (kms === nbRanges[24].end) {
        nb24EndVr = current24Vr;
        endPoints["24"] = { kms: kms, vr: current24Vr };
      }
    }

    // For NB 48, calculate all points including the end point (250000)
    let nb48EndVr = null;
    const decrement48 = decrements["48-60"];
    let current48Vr = vrValues["48"];

    for (
      let kms = parseInt(staticData[2].kms) + 10000;
      kms <= nbRanges[48].end;
      kms += 10000
    ) {
      current48Vr = current48Vr - decrement48;

      expanded.push({
        nb: "48",
        kms: kms.toString(),
        vr: current48Vr,
        isInitial: false,
      });

      if (kms === nbRanges[48].end) {
        nb48EndVr = current48Vr;
        endPoints["48"] = { kms: kms, vr: current48Vr };
      }
    }

    // For NB 60, calculate all points
    let current60Vr = vrValues["60"];

    for (
      let kms = parseInt(staticData[3].kms) + 10000;
      kms <= nbRanges[60].end;
      kms += 10000
    ) {
      current60Vr = current60Vr - decrement48; // Use same decrement as 48-60 range

      expanded.push({
        nb: "60",
        kms: kms.toString(),
        vr: current60Vr,
        isInitial: false,
      });
    }

    // Now for NB 18, CONTINUE the pattern from where NB 12 ends
    if (nb12EndVr !== null) {
      let current18Vr = nb12EndVr - decrement12; // Continue the pattern by subtracting the decrement

      for (
        let kms = nbRanges[18].start;
        kms <= nbRanges[18].end;
        kms += 10000
      ) {
        expanded.push({
          nb: "18",
          kms: kms.toString(),
          vr: current18Vr,
          isInitial: false,
        });

        current18Vr = current18Vr - decrement12; // Continue subtracting for subsequent points
      }
    }

    // For NB 30, CONTINUE the pattern from where NB 24 ends
    if (nb24EndVr !== null) {
      let current30Vr = nb24EndVr - decrement24; // Continue the pattern by subtracting the decrement

      for (
        let kms = nbRanges[30].start;
        kms <= nbRanges[30].end;
        kms += 10000
      ) {
        expanded.push({
          nb: "30",
          kms: kms.toString(),
          vr: current30Vr,
          isInitial: false,
        });

        current30Vr = current30Vr - decrement24; // Continue subtracting for subsequent points
      }

      // Store the last value of NB 30 for use with NB 36
      const nb30FinalVr = current30Vr + decrement24; // Add back the last decrement to get the value at 250000

      // For NB 36, continue the same pattern from the last value of NB 30
      // Start just one decrement step down from NB 30's last value
      let current36Vr = nb30FinalVr - decrement24; // Just one decrement step down

      for (
        let kms = nbRanges[36].start;
        kms <= nbRanges[36].end;
        kms += 10000
      ) {
        expanded.push({
          nb: "36",
          kms: kms.toString(),
          vr: current36Vr,
          isInitial: false,
        });

        current36Vr = current36Vr - decrement24; // Continue subtracting for subsequent points
      }
    }

    // Sort the expanded data by NB, then by KMS
    expanded.sort((a, b) => {
      const nbDiff = parseInt(a.nb) - parseInt(b.nb);
      if (nbDiff !== 0) return nbDiff;
      return parseInt(a.kms) - parseInt(b.kms);
    });

    setCalculatedData(expanded);
    setExpandedTable(true);
  };

  // Calculate price based on VR and percentage input
  const calculatePrice = (vr) => {
    if (
      !percentageInput ||
      isNaN(parseFloat(percentageInput)) ||
      parseFloat(percentageInput) <= 0
    ) {
      return "-";
    }

    const percentage = parseFloat(percentageInput);
    // Use the raw VR value without additional formatting
    const vrValue = parseFloat(vr);

    // Calculate price with the unformatted VR value
    const price = (vrValue / 100) * percentage;

    return price.toFixed(2);
  };

  // Render the detail view
  const renderDetailsView = () => {
    if (loading) {
      return (
        <Card className="shadow-lg">
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" className="text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading details...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // If there's no details data or empty array, show static data
    if (!dataDetails || dataDetails.length === 0) {
      return (
        <Card className="shadow-lg">
          <CardHeader className="border-b flex justify-between">
            <Button
              variant="outline"
              onClick={() => setExpandedTable(false)}
              className={expandedTable ? "" : "hidden"}
            >
              Back to Input
            </Button>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">
                Details for VR Code: {selectedKey}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {expandedTable
                  ? "Expanded table with calculated VR values:"
                  : "Please fill in the base VR values for each NB:"}
              </p>
            </div>

            <Button
              onClick={() => {
                calculateVr();
              }}
              className={expandedTable ? "hidden" : ""}
            >
              Calculer
            </Button>
            <Button
              onClick={() => {}}
              className={!expandedTable ? "hidden" : ""}
            >
              Insert into DB
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {!expandedTable ? (
                <Table className={""}>
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      <TableHead className="font-semibold">NB (mois)</TableHead>
                      <TableHead className="font-semibold">KMS (km)</TableHead>
                      <TableHead className="font-semibold">VR</TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex flex-col gap-2">
                          <Input
                            type="number"
                            placeholder="Enter Price"
                            value={percentageInput}
                            onChange={(e) => setPercentageInput(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staticData.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="font-medium">{item.nb}</TableCell>
                        <TableCell>{item.kms}</TableCell>
                        <TableCell>
                          <Input
                            value={item.vr}
                            onChange={(e) =>
                              handleVrChange(index, e.target.value)
                            }
                            placeholder="Enter VR value"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>{calculatePrice(item.vr)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table className={""}>
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      <TableHead className="font-semibold">NB (mois)</TableHead>
                      <TableHead className="font-semibold">KMS (km)</TableHead>
                      <TableHead className="font-semibold">VR</TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex flex-col gap-2">
                          <Input
                            type="number"
                            placeholder="Prix Achat"
                            value={percentageInput}
                            onChange={(e) => setPercentageInput(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculatedData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={`hover:bg-slate-50 transition-colors ${
                          item.isInitial ? "bg-green-100" : ""
                        }`}
                      >
                        <TableCell className="font-medium">{item.nb}</TableCell>
                        <TableCell>{item.kms}</TableCell>
                        <TableCell>{item.vr.toFixed(2)}</TableCell>
                        <TableCell>{calculatePrice(item.vr)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // If we have actual details data, display it
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold text-slate-800">
            Details for VR Code: {selectedKey}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  {dataDetails.length > 0 &&
                    Object.keys(dataDetails[0]).map((key, index) => (
                      <TableHead key={index} className="font-semibold">
                        {key}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataDetails.map((item, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {Object.values(item).map((value, valueIndex) => (
                      <TableCell key={valueIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-start mb-4">
        {selectedKey && !tableVisible ? (
          <Button onClick={() => setTableVisible(!tableVisible)}>Back</Button>
        ) : null}
      </div>

      {selectedKey && !tableVisible ? (
        renderDetailsView()
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-slate-800">
                VR Code Management
              </CardTitle>
            </div>
            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Search VR codes..."
                className="pl-10 w-full md:w-80 focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="font-semibold">Code VR</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Modifiable</TableHead>
                    <TableHead className="w-12">{""}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Spinner size="lg" className="text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Loading data...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {item.code_vr}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.active == 1 ? "success" : "secondary"}
                            className="px-2 py-1"
                          >
                            {item.active == 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.modifiable == 2 ? "outline" : "secondary"
                            }
                            className="px-2 py-1"
                          >
                            {item.modifiable == 2 ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleEyeClick(item.code_vr)}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
