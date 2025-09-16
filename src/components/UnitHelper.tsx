import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UnitConverter } from "./UnitConverter";
import { BlockTimeConverter } from "./BlockTimeConverter";
import { GasEstimator } from "./GasEstimator";

export function UnitHelper() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Helper Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <UnitConverter />
          <BlockTimeConverter />
          <GasEstimator />
        </div>
      </CardContent>
    </Card>
  );
}
