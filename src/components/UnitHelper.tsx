import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UnitConverter } from "./UnitConverter";
import { BlockTimeConverter } from "./BlockTimeConverter";

export function UnitHelper() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Unit Helper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <UnitConverter />
          <BlockTimeConverter />
        </div>
      </CardContent>
    </Card>
  );
}
