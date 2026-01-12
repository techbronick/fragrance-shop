
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscoverySetNameEditorProps {
  setName: string;
  onSetNameChange: (name: string) => void;
}

export const DiscoverySetNameEditor = ({ setName, onSetNameChange }: DiscoverySetNameEditorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Numele Setului</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="setName">Nume personalizat</Label>
          <Input
            id="setName"
            value={setName}
            onChange={(e) => onSetNameChange(e.target.value)}
            placeholder="Numele setului tău Discovery"
          />
        </div>
      </CardContent>
    </Card>
  );
};
