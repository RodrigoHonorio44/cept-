const GradeImpressao = ({ turma, grade, dias, slots }) => {
  return (
    <div className="hidden-print-template bg-white text-black" 
      style={{ 
        padding: '40px', 
        width: '100%',
        boxSizing: 'border-box'
      }}>
      
      {/* CABEÇALHO DO DOCUMENTO */}
      <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic leading-none">Horário Escolar</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Secretaria de Ensino • 2026</p>
        </div>
        <div className="text-right">
          <div 
            className="bg-black text-white px-6 py-1 text-2xl font-black uppercase mb-1" 
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            TURMA: {turma}
          </div>
          <p className="text-[10px] font-bold">Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* GRADE EM GRID - Substituindo Table por Grid para controle total no papel */}
      <div style={{ 
        display: 'block', 
        width: '100%', 
        border: '2px solid black' 
      }}>
        
        {/* CABEÇALHO DE DIAS (LINHA) */}
        <div style={{ display: 'flex', width: '100%', borderBottom: '2px solid black' }}>
          {dias.map(dia => (
            <div 
              key={dia} 
              style={{ 
                width: '20%', 
                backgroundColor: '#f1f5f9', 
                padding: '8px', 
                borderRight: dia !== dias[dias.length - 1] ? '1px solid black' : 'none',
                textAlign: 'center',
                fontWeight: '900',
                fontSize: '10px',
                textTransform: 'uppercase',
                fontStyle: 'italic',
                WebkitPrintColorAdjust: 'exact'
              }}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* SLOTS DE AULAS */}
        {slots.map((linha, index) => (
          <div 
            key={linha} 
            style={{ 
              display: 'flex', 
              width: '100%', 
              borderBottom: index !== slots.length - 1 ? '1px solid black' : 'none' 
            }}
          >
            {dias.map((dia, diaIdx) => {
              const info = grade[`${dia}-${linha}`];
              return (
                <div 
                  key={`${dia}-${linha}`} 
                  style={{ 
                    width: '20%', 
                    height: '90px', 
                    padding: '8px', 
                    borderRight: diaIdx !== dias.length - 1 ? '1px solid black' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  {info ? (
                    <div className="flex flex-col justify-center items-center gap-1">
                      <div 
                        className="text-[9px] font-black leading-none bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                        style={{ WebkitPrintColorAdjust: 'exact' }}
                      >
                        {info.horarioManual}
                      </div>
                      <div className="text-[12px] font-black uppercase italic leading-tight text-black">
                        {info.materia}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-600">
                        {info.professor}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-200 text-[8px] font-bold italic uppercase opacity-40">vago</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* RODAPÉ DO DOCUMENTO */}
      <div className="mt-12 pt-4 border-t-2 border-black flex justify-between items-center text-[10px] font-black uppercase">
        <span className="text-slate-500 italic">Documento Oficial de Grade de Horários</span>
        <span className="text-black">Assinatura da Coordenação: _____________________________________________</span>
      </div>
    </div>
  );
};