import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";

const EMPTY_FORM = {
  description: "",
  difficulty: "",
  returnType: "",
  visibleTestCases: "",
  hiddenTestCases: "",
};

export function AddQuestionDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);

  const updateField = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      description: form.description.trim(),
      difficulty: form.difficulty.trim(),
      returnType: form.returnType.trim(),
      visibleTestCases: form.visibleTestCases.trim(),
      hiddenTestCases: form.hiddenTestCases.trim(),
    };

    onSubmit?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add question</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={form.description}
              onChange={updateField("description")}
              rows={5}
              placeholder="Describe the problem statement"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
              <Input
                value={form.difficulty}
                onChange={updateField("difficulty")}
                placeholder="Easy, Medium, Hard"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Output return type</label>
              <Input
                value={form.returnType}
                onChange={updateField("returnType")}
                placeholder="e.g. number, string, array"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Visible test cases</label>
            <Textarea
              value={form.visibleTestCases}
              onChange={updateField("visibleTestCases")}
              rows={6}
              placeholder="Input/output per test case. Leave at least one blank line between test cases."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Hidden test cases</label>
            <Textarea
              value={form.hiddenTestCases}
              onChange={updateField("hiddenTestCases")}
              rows={6}
              placeholder="Input/output per test case. Leave at least one blank line between test cases."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add question</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
