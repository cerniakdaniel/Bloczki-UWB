import React, { useState, useEffect, useRef } from "react";
import { Node, Edge } from "reactflow";
import Canvas from "./components/Canvas";
import {
  createDiagram,
  listDiagrams,
  saveDiagram,
  validateDiagram,
  generatePseudocode,
  deleteDiagram,
  getDiagram,
  renameDiagram,
} from "./api/client";
import { ValidationResult } from "./types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DEMO_DIAGRAMS = [
  {
    name: "Sprawdzenie liczby parzystej",
    blocks: [
      {
        id: "d1_s",
        type: "START",
        content: "",
        position_x: 400,
        position_y: 50,
      },
      {
        id: "d1_i",
        type: "INPUT",
        content: "n",
        position_x: 400,
        position_y: 160,
      },
      {
        id: "d1_c",
        type: "CONDITION",
        content: "n mod 2 = 0",
        position_x: 400,
        position_y: 290,
      },
      {
        id: "d1_o1",
        type: "OUTPUT",
        content: "Parzysta",
        position_x: 230,
        position_y: 430,
      },
      {
        id: "d1_o2",
        type: "OUTPUT",
        content: "Nieparzysta",
        position_x: 570,
        position_y: 430,
      },
      {
        id: "d1_e",
        type: "STOP",
        content: "",
        position_x: 400,
        position_y: 560,
      },
    ],
    connections: [
      { id: "c1", from_block_id: "d1_s", to_block_id: "d1_i", label: "" },
      { id: "c2", from_block_id: "d1_i", to_block_id: "d1_c", label: "" },
      { id: "c3", from_block_id: "d1_c", to_block_id: "d1_o1", label: "TAK" },
      { id: "c4", from_block_id: "d1_c", to_block_id: "d1_o2", label: "NIE" },
      { id: "c5", from_block_id: "d1_o1", to_block_id: "d1_e", label: "" },
      { id: "c6", from_block_id: "d1_o2", to_block_id: "d1_e", label: "" },
    ],
  },
  {
    name: "Obliczanie silni",
    blocks: [
      {
        id: "d2_s",
        type: "START",
        content: "",
        position_x: 400,
        position_y: 50,
      },
      {
        id: "d2_i",
        type: "INPUT",
        content: "n",
        position_x: 400,
        position_y: 160,
      },
      {
        id: "d2_o1",
        type: "OPERATION",
        content: "wynik = 1",
        position_x: 400,
        position_y: 260,
      },
      {
        id: "d2_o2",
        type: "OPERATION",
        content: "i = 1",
        position_x: 400,
        position_y: 360,
      },
      {
        id: "d2_l",
        type: "LOOP_WHILE",
        content: "i <= n",
        position_x: 400,
        position_y: 470,
      },
      {
        id: "d2_o3",
        type: "OPERATION",
        content: "wynik = wynik * i",
        position_x: 200,
        position_y: 600,
      },
      {
        id: "d2_o4",
        type: "OPERATION",
        content: "i = i + 1",
        position_x: 200,
        position_y: 700,
      },
      {
        id: "d2_out",
        type: "OUTPUT",
        content: "wynik",
        position_x: 400,
        position_y: 600,
      },
      {
        id: "d2_e",
        type: "STOP",
        content: "",
        position_x: 400,
        position_y: 720,
      },
    ],
    connections: [
      { id: "c1", from_block_id: "d2_s", to_block_id: "d2_i", label: "" },
      { id: "c2", from_block_id: "d2_i", to_block_id: "d2_o1", label: "" },
      { id: "c3", from_block_id: "d2_o1", to_block_id: "d2_o2", label: "" },
      { id: "c4", from_block_id: "d2_o2", to_block_id: "d2_l", label: "" },
      { id: "c5", from_block_id: "d2_l", to_block_id: "d2_o3", label: "TAK" },
      { id: "c6", from_block_id: "d2_o3", to_block_id: "d2_o4", label: "" },
      { id: "c7", from_block_id: "d2_o4", to_block_id: "d2_l", label: "" },
      { id: "c8", from_block_id: "d2_l", to_block_id: "d2_out", label: "NIE" },
      { id: "c9", from_block_id: "d2_out", to_block_id: "d2_e", label: "" },
    ],
  },
  {
    name: "Wyszukiwanie maksimum z tablicy",
    blocks: [
      {
        id: "d3_s",
        type: "START",
        content: "",
        position_x: 400,
        position_y: 50,
      },
      {
        id: "d3_i1",
        type: "INPUT",
        content: "n",
        position_x: 400,
        position_y: 160,
      },
      {
        id: "d3_i2",
        type: "INPUT",
        content: "tab[1..n]",
        position_x: 400,
        position_y: 260,
      },
      {
        id: "d3_o1",
        type: "OPERATION",
        content: "maks = tab[1]",
        position_x: 400,
        position_y: 360,
      },
      {
        id: "d3_o2",
        type: "OPERATION",
        content: "i = 2",
        position_x: 400,
        position_y: 460,
      },
      {
        id: "d3_l",
        type: "LOOP_WHILE",
        content: "i <= n",
        position_x: 400,
        position_y: 560,
      },
      {
        id: "d3_c",
        type: "CONDITION",
        content: "tab[i] > maks",
        position_x: 200,
        position_y: 690,
      },
      {
        id: "d3_o3",
        type: "OPERATION",
        content: "maks = tab[i]",
        position_x: 200,
        position_y: 820,
      },
      {
        id: "d3_o4",
        type: "OPERATION",
        content: "i = i + 1",
        position_x: 200,
        position_y: 940,
      },
      {
        id: "d3_out",
        type: "OUTPUT",
        content: "maks",
        position_x: 400,
        position_y: 690,
      },
      {
        id: "d3_e",
        type: "STOP",
        content: "",
        position_x: 400,
        position_y: 820,
      },
    ],
    connections: [
      { id: "c1", from_block_id: "d3_s", to_block_id: "d3_i1", label: "" },
      { id: "c2", from_block_id: "d3_i1", to_block_id: "d3_i2", label: "" },
      { id: "c3", from_block_id: "d3_i2", to_block_id: "d3_o1", label: "" },
      { id: "c4", from_block_id: "d3_o1", to_block_id: "d3_o2", label: "" },
      { id: "c5", from_block_id: "d3_o2", to_block_id: "d3_l", label: "" },
      { id: "c6", from_block_id: "d3_l", to_block_id: "d3_c", label: "TAK" },
      { id: "c7", from_block_id: "d3_c", to_block_id: "d3_o3", label: "TAK" },
      { id: "c8", from_block_id: "d3_c", to_block_id: "d3_o4", label: "NIE" },
      { id: "c9", from_block_id: "d3_o3", to_block_id: "d3_o4", label: "" },
      { id: "c10", from_block_id: "d3_o4", to_block_id: "d3_l", label: "" },
      { id: "c11", from_block_id: "d3_l", to_block_id: "d3_out", label: "NIE" },
      { id: "c12", from_block_id: "d3_out", to_block_id: "d3_e", label: "" },
    ],
  },
];

export default function App() {
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [pseudocode, setPseudocode] = useState<string | null>(null);
  const [view, setView] = useState<"canvas" | "pseudo">("canvas");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listDiagrams()
      .then(async (list) => {
        const demoNames = DEMO_DIAGRAMS.map((d) => d.name);
        const hasDemo = list.some((d: any) => demoNames.includes(d.name));
        if (!hasDemo) {
          for (const demo of DEMO_DIAGRAMS) {
            try {
              const d = await createDiagram(demo.name);
              await saveDiagram(d.id, {
                blocks: demo.blocks,
                connections: demo.connections,
              });
            } catch (e) {}
          }
          listDiagrams()
            .then(setDiagrams)
            .catch(() => {});
        } else {
          setDiagrams(list);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm(
        "Masz niezapisane zmiany! Czy chcesz kontynuować?",
      );
      if (!ok) return;
    }
    const d = await createDiagram(newName);
    setDiagrams((prev) => [d, ...prev]);
    setCurrentId(d.id);
    setCanvasKey((k) => k + 1);
    setNewName("");
    setHasUnsavedChanges(false);
    setValidation(null);
    setPseudocode(null);
    setView("canvas");
  };

  const handleSelectDiagram = (id: string) => {
    if (!id) return;
    if (hasUnsavedChanges) {
      const ok = window.confirm(
        "Masz niezapisane zmiany! Czy chcesz przełączyć diagram bez zapisywania?",
      );
      if (!ok) return;
    }
    setCurrentId(id);
    setCanvasKey((k) => k + 1);
    setHasUnsavedChanges(false);
    setValidation(null);
    setPseudocode(null);
    setView("canvas");
  };

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    if (!currentId) return;
    const blocks = nodes.map((n) => ({
      id: n.id,
      type: n.data?.type || "junction",
      content: n.data?.content || "",
      position_x: n.position.x,
      position_y: n.position.y,
    }));
    const connections = edges.map((e) => ({
      id: e.id,
      from_block_id: e.source,
      to_block_id: e.target,
      label: String(e.label || e.data?.label || ""),
    }));
    await saveDiagram(currentId, { blocks, connections });
    setHasUnsavedChanges(false);
    alert("Zapisano!");
  };

  const handleValidate = async () => {
    if (!currentId) return;
    const r = await validateDiagram(currentId);
    setValidation(r);
  };

  const handleGenerate = async () => {
    if (!currentId) return;
    try {
      const r = await generatePseudocode(currentId);
      setPseudocode(r.pseudocode);
      setView("pseudo");
    } catch (e: any) {
      alert(e.response?.data?.errors?.join("\n") || "Błąd generowania");
    }
  };

  const handleExportPNG = async () => {
    const el = canvasRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
          const inputs = clonedEl.querySelectorAll("input, textarea");
          inputs.forEach((input: any) => {
            const div = _clonedDoc.createElement("div");
            div.style.fontSize = "11px";
            div.style.fontWeight = "bold";
            div.style.textAlign = "center";
            div.textContent = input.value;
            input.parentNode?.replaceChild(div, input);
          });
        },
      });
      const link = document.createElement("a");
      link.download = `${diagrams.find((d) => d.id === currentId)?.name || "diagram"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("Błąd eksportu PNG");
    }
  };

  const handleExportPseudocodePDF = () => {
    if (!pseudocode) {
      alert("Najpierw wygeneruj pseudokod!");
      return;
    }
    const doc = new jsPDF();
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(pseudocode, 180);
    doc.text(lines, 15, 20);
    doc.save(
      `${diagrams.find((d) => d.id === currentId)?.name || "pseudokod"}.pdf`,
    );
  };

  const handleExportJSON = async () => {
    if (!currentId) return;
    try {
      const diagram = await getDiagram(currentId);
      const data = {
        name: diagram.name,
        blocks: diagram.blocks,
        connections: diagram.connections,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${diagram.name || "diagram"}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Błąd eksportu JSON");
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.blocks && data.connections) {
          const name = data.name || file.name.replace(".json", "");
          const d = await createDiagram(name);
          await saveDiagram(d.id, {
            blocks: data.blocks,
            connections: data.connections,
          });
          const list = await listDiagrams();
          setDiagrams(list);
          setCurrentId(d.id);
          setCanvasKey((k) => k + 1);
          setHasUnsavedChanges(false);
          setValidation(null);
          setPseudocode(null);
          setView("canvas");
          alert(`Wczytano jako nowy diagram: "${name}"`);
        } else {
          alert("Nieprawidłowy format pliku.");
        }
      } catch {
        alert("Błąd wczytywania pliku JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Usunąć ten diagram?")) return;
    await deleteDiagram(id);
    setDiagrams((prev) => prev.filter((d) => d.id !== id));
    if (currentId === id) {
      setCurrentId(null);
      setHasUnsavedChanges(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    await renameDiagram(id, renameValue);
    setDiagrams((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: renameValue } : d)),
    );
    setRenamingId(null);
    setRenameValue("");
  };

  const currentDiagram = diagrams.find((d) => d.id === currentId);

  return (
    <div
      style={{
        fontFamily: "system-ui",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#1e1e2e",
          color: "white",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <img
          src="/uwb.png"
          alt="UWB"
          style={{ height: 36 }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <span style={{ fontWeight: "bold", fontSize: 16 }}>Bloczki UWB</span>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nazwa nowego diagramu..."
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            fontSize: 12,
            width: 160,
          }}
        />
        <button
          onClick={handleCreate}
          style={{
            padding: "6px 10px",
            background: "#4ade80",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 12,
          }}
        >
          + Nowy
        </button>
        <select
          onChange={(e) => handleSelectDiagram(e.target.value)}
          value={currentId || ""}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            maxWidth: 180,
            fontSize: 12,
          }}
        >
          <option value="">-- wybierz diagram --</option>
          {diagrams.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {currentId && renamingId === currentId ? (
          <>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename(currentId)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                width: 130,
              }}
              autoFocus
            />
            <button
              onClick={() => handleRename(currentId)}
              style={{
                padding: "6px 10px",
                background: "#4ade80",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✓
            </button>
            <button
              onClick={() => setRenamingId(null)}
              style={{
                padding: "6px 10px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✗
            </button>
          </>
        ) : (
          currentId && (
            <button
              onClick={() => {
                setRenamingId(currentId);
                setRenameValue(currentDiagram?.name || "");
              }}
              style={{
                padding: "6px 10px",
                background: "#f59e0b",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✏️
            </button>
          )
        )}
        {hasUnsavedChanges && (
          <span
            style={{
              background: "#f59e0b",
              color: "white",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            ⚠️ Niezapisane zmiany
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => importRef.current?.click()}
          style={{
            padding: "6px 10px",
            background: "#64748b",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 12,
          }}
        >
          📂 Wczytaj
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleImportJSON}
        />
        {currentId && (
          <>
            <button
              onClick={handleValidate}
              style={{
                padding: "6px 10px",
                background: "#fbbf24",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              ✅ Waliduj
            </button>
            <button
              onClick={handleGenerate}
              style={{
                padding: "6px 10px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              📝 Pseudokod
            </button>
            <button
              onClick={handleExportPNG}
              style={{
                padding: "6px 10px",
                background: "#34d399",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              🖼️ PNG
            </button>
            <button
              onClick={handleExportPseudocodePDF}
              style={{
                padding: "6px 10px",
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              📄 PDF
            </button>
            <button
              onClick={handleExportJSON}
              style={{
                padding: "6px 10px",
                background: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              💾 JSON
            </button>
            <button
              onClick={() => handleDelete(currentId)}
              style={{
                padding: "6px 10px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              🗑️ Usuń
            </button>
          </>
        )}
      </div>
      {validation && (
        <div
          style={{
            background: validation.isValid ? "#d1fae5" : "#fee2e2",
            padding: "8px 16px",
            borderBottom: "1px solid #ccc",
            display: "flex",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            {validation.isValid ? (
              "✅ Schemat jest poprawny!"
            ) : (
              <>
                <span>❌ Błędy:</span>
                <ul style={{ margin: "4px 0 0 0" }}>
                  {validation.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <button
            onClick={() => setValidation(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
      {view === "pseudo" && pseudocode && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            padding: 24,
            background: "#0f172a",
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setView("canvas")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#334155",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              ← Wróć
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(pseudocode)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#6366f1",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              📋 Kopiuj
            </button>
            <button
              onClick={handleExportPseudocodePDF}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#0ea5e9",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              📄 Eksport PDF
            </button>
          </div>
          <pre
            style={{
              flex: 1,
              color: "#e2e8f0",
              fontSize: 15,
              lineHeight: 1.8,
              overflow: "auto",
              margin: 0,
            }}
          >
            {pseudocode}
          </pre>
        </div>
      )}
      {currentId ? (
        <div ref={canvasRef} style={{ flex: 1, position: "relative" }}>
          <Canvas
            key={canvasKey}
            diagramId={currentId}
            onSave={handleSave}
            onUnsavedChange={setHasUnsavedChanges}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: 18,
          }}
        >
          Utwórz lub wybierz diagram, aby zacząć.
        </div>
      )}
    </div>
  );
}
