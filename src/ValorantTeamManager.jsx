import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Trophy, GripVertical } from "lucide-react";

const initialMembers = [
  { id: "1", name: "Alice", rank: 3, wins: 0 },
  { id: "2", name: "Bob", rank: 2, wins: 0 },
  { id: "3", name: "Charlie", rank: 1, wins: 0 },
  { id: "4", name: "David", rank: 2, wins: 0 },
  { id: "5", name: "Eve", rank: 3, wins: 0 },
  { id: "6", name: "Frank", rank: 1, wins: 0 },
  { id: "7", name: "Grace", rank: 2, wins: 0 },
  { id: "8", name: "Henry", rank: 2, wins: 0 },
  { id: "9", name: "Ivy", rank: 3, wins: 0 },
  { id: "10", name: "Jack", rank: 1, wins: 0 },
];

export default function ValorantTeamManager() {
  const [unassigned, setUnassigned] = useState(initialMembers);
  const [attackers, setAttackers] = useState([]);
  const [defenders, setDefenders] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const draggedMember = [...unassigned, ...attackers, ...defenders].find(
      (m) => m.id === active.id
    );
    if (!draggedMember) return;

    // 既存から削除
    setUnassigned((prev) => prev.filter((m) => m.id !== draggedMember.id));
    setAttackers((prev) => prev.filter((m) => m.id !== draggedMember.id));
    setDefenders((prev) => prev.filter((m) => m.id !== draggedMember.id));

    // チームに追加
    if (over.id === "attackers" && attackers.length < 5) {
      setAttackers((prev) => [...prev, draggedMember]);
    } else if (over.id === "defenders" && defenders.length < 5) {
      setDefenders((prev) => [...prev, draggedMember]);
    } else {
      setUnassigned((prev) => [...prev, draggedMember]);
    }
  };

  const handleWin = (team) => {
    const winningTeam = team === "A" ? attackers : defenders;
    const updated = unassigned.map((m) =>
      winningTeam.some((w) => w.id === m.id) ? { ...m, wins: m.wins + 1 } : m
    );
    setUnassigned(updated);
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex justify-center p-6">
        <div className="w-full max-w-6xl flex flex-col gap-6 text-center">
          {/* メンバー一覧（2カラム） */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">メンバー一覧</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DroppableArea id="unassigned" title="" members={unassigned} />
            </div>
          </div>
  
          {/* 操作 + チーム 並列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 操作パネル */}
            <div className="bg-white p-4 rounded shadow flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4">操作</h2>
              <button
                onClick={() => handleWin("A")}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-40"
              >
                アタッカー勝利
              </button>
              <button
                onClick={() => handleWin("B")}
                className="bg-red-500 text-white px-4 py-2 rounded w-40"
              >
                ディフェンダー勝利
              </button>
            </div>
  
            {/* チーム表示 */}
            <div className="bg-white p-4 rounded shadow flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4">チーム</h2>
              <div className="grid grid-cols-2 gap-4 w-full">
                <DroppableArea id="attackers" title="アタッカー" members={attackers} color="blue" />
                <DroppableArea id="defenders" title="ディフェンダー" members={defenders} color="red" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
  

}

function DroppableArea({ id, title, members, color = "gray" }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded border-2 border-dashed mb-4 ${
        color === "blue"
          ? "bg-blue-50 border-blue-300"
          : color === "red"
          ? "bg-red-50 border-red-300"
          : "bg-gray-100 border-gray-300"
      }`}
      style={{ minHeight: "180px" }}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      {members.map((m) => (
        <DraggableMember key={m.id} member={m} />
      ))}
    </div>
  );
}

function DraggableMember({ member }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: member.id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-2 rounded shadow mb-2 flex justify-between items-center cursor-move"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="text-gray-400" size={16} />
        <span>
          {member.name} (R{member.rank})
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Trophy className="text-yellow-500" size={16} />
        <span>{member.wins}</span>
      </div>
    </div>
  );
}
