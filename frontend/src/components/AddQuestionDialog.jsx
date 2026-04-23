import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import axios from "axios";

const EMPTY_FORM = {
  title: "",
  description: "",
  difficulty: "",
  returnType: "",
  visibleInputs: "",
  visibleOutputs: "",
  hiddenInputs: "",
  hiddenOutputs: "",
};

export function AddQuestionDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrorMessage("");
    }
  }, [open]);

  const updateField = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    console.log(2);
    
    const payload = {      
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty.trim(),
      returnType: form.returnType.trim(),
      visibleInput: form.visibleInputs.trim(),
      visibleOutput: form.visibleOutputs.trim(),
      hiddenInput: form.hiddenInputs.trim(),
      hiddenOutput: form.hiddenOutputs.trim(),
    };

    try {
      setErrorMessage("");
      await axios.post("/feature/v1/question/storeQuestion", payload);
      onSubmit?.(payload);// this is a onSubmit callback passed from parent component which will execute the onsubmit function written in the parent component and pass the payload to it.
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add question";
      setErrorMessage(message);
      window.alert(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add question</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {errorMessage ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input
              value={form.title}
              onChange={updateField("title")}
              placeholder="Question title"
            />
          </div>

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
            <label className="text-xs font-medium text-muted-foreground">Visible Inputs</label>
            <Textarea
              value={form.visibleInputs}
              onChange={updateField("visibleInputs")}
              rows={6}
              placeholder="One visible input per line or block. Keep case boundaries clear."
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Visible Outputs</label>
            <Textarea
              value={form.visibleOutputs}
              onChange={updateField("visibleOutputs")}
              rows={6}
              placeholder="Expected output for visible inputs in matching order."
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Hidden Inputs</label>
            <Textarea
              value={form.hiddenInputs}
              onChange={updateField("hiddenInputs")}
              rows={6}
              placeholder="Private judge inputs, one case per line or separated blocks."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground">Hidden Outputs</label>
            <Textarea
              value={form.hiddenOutputs}
              onChange={updateField("hiddenOutputs")}
              rows={6}
              placeholder="Expected outputs for hidden inputs in matching order."
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
