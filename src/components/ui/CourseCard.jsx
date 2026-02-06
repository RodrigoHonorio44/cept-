// src/components/ui/CourseCard.jsx
export const CourseCard = ({ curso }) => (
  <div className="border rounded-2xl p-4">
    <h3 className="capitalize font-bold text-blue-900">{curso.nome}</h3> 
    {/* 'capitalize' faz: "robótica" -> "Robótica" apenas na tela */}
    <p className="lowercase text-slate-500">{curso.descricao}</p>
  </div>
);