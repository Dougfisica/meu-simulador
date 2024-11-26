import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Info, Ruler, ArrowRightCircle, RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MotionSimulator = () => {
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(10);
  const [a, setA] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [data, setData] = useState([]);
  const [view, setView] = useState('track');
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  
  const calculatePosition = (t) => x0 + v0 * t + 0.5 * a * t * t;
  const calculateVelocity = (t) => v0 + a * t;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Desenhar pista
    const drawTrack = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Pista oval
      ctx.beginPath();
      ctx.ellipse(200, 150, 180, 100, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 20;
      ctx.stroke();
      
      // Linha de partida
      ctx.beginPath();
      ctx.moveTo(200, 50);
      ctx.lineTo(200, 250);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    // Desenhar carro
    const drawCar = (position) => {
      const trackLength = 1000;
      const normalizedPos = position % trackLength;
      const angle = (normalizedPos / trackLength) * 2 * Math.PI;
      
      const carX = 200 + Math.cos(angle) * 180;
      const carY = 150 + Math.sin(angle) * 100;
      
      ctx.beginPath();
      ctx.arc(carX, carY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    };
    
    drawTrack();
    if (isRunning) {
      drawCar(distance);
    } else {
      drawCar(x0);
    }
  }, [isRunning, distance, x0]);

  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsedTime = (timestamp - startTimeRef.current) / 1000;
    const newPosition = calculatePosition(elapsedTime);
    const newVelocity = calculateVelocity(elapsedTime);
    
    setTime(elapsedTime);
    setDistance(newPosition);
    setVelocity(newVelocity);
    
    setData(prev => [...prev, {
      time: Number(elapsedTime.toFixed(2)),
      position: Number(newPosition.toFixed(2)),
      velocity: Number(newVelocity.toFixed(2))
    }]);
    
    if (newPosition < 1000) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
    }
  };

  const startSimulation = () => {
    setIsRunning(true);
    setData([]);
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setDistance(x0);
    setVelocity(v0);
    setData([]);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Simulador de Movimento Uniformemente Variado</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controles */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="mr-2" size={20} />
              Parâmetros
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center mb-2">
                  <Ruler className="mr-2" size={16} />
                  Posição Inicial (X₀): {x0} m
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={x0}
                  onChange={(e) => setX0(Number(e.target.value))}
                  className="w-full"
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <label className="flex items-center mb-2">
                  <ArrowRightCircle className="mr-2" size={16} />
                  Velocidade Inicial (V₀): {v0} m/s
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={v0}
                  onChange={(e) => setV0(Number(e.target.value))}
                  className="w-full"
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <label className="flex items-center mb-2">
                  <BarChart className="mr-2" size={16} />
                  Aceleração (a): {a} m/s²
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={a}
                  onChange={(e) => setA(Number(e.target.value))}
                  className="w-full"
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
            >
              <ArrowRightCircle className="mr-2" size={16} />
              Iniciar
            </button>
            <button
              onClick={resetSimulation}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center"
            >
              <RefreshCcw className="mr-2" size={16} />
              Resetar
            </button>
          </div>
        </div>
        
        {/* Visualização */}
        <div className="md:col-span-2">
          <div className="flex justify-center mb-4 gap-2">
            <button
              onClick={() => setView('track')}
              className={`px-4 py-2 rounded ${view === 'track' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Pista
            </button>
            <button
              onClick={() => setView('position')}
              className={`px-4 py-2 rounded ${view === 'position' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Posição
            </button>
            <button
              onClick={() => setView('velocity')}
              className={`px-4 py-2 rounded ${view === 'velocity' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Velocidade
            </button>
          </div>
          
          {view === 'track' ? (
            <canvas
              ref={canvasRef}
              width="400"
              height="300"
              className="border border-gray-300 rounded-lg mx-auto"
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={data}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={view === 'position' ? 'position' : 'velocity'}
                    stroke={view === 'position' ? '#3b82f6' : '#10b981'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-mono text-lg font-bold mb-2">Equação do Movimento</p>
              <p>X = {x0} + {v0}t + ½({a})t²</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-mono text-lg font-bold mb-2">Valores Atuais</p>
              <p>Tempo: {time.toFixed(2)} s</p>
              <p>Posição: {distance.toFixed(2)} m</p>
              <p>Velocidade: {velocity.toFixed(2)} m/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionSimulator;
