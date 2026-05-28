'use client';

import { useState } from 'react';
import { Sparkles, X, Plus } from 'lucide-react';
import OpportunityCard from './OpportunityCard';
import SkeletonCard from './SkeletonCard';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'AWS',
  'Machine Learning', 'Data Science', 'Blockchain', 'Go', 'Rust',
  'Flutter', 'Android', 'iOS', 'DevOps', 'SQL', 'MongoDB',
];

export default function RecommendationSection() {
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setInput('');
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSearch = async () => {
    if (!skills.length) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });
      const data = await res.json();
      setResults(data.opportunities || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(93,254,202,0.1)', border: '1px solid rgba(93,254,202,0.2)' }}>
          <Sparkles size={16} className="text-[#5dfeca]" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Best Match For You</h2>
          <p className="text-gray-500 text-xs">Enter your skills to see personalized matches</p>
        </div>
      </div>

      {/* Skill input */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(93,254,202,0.04)', border: '1px solid rgba(93,254,202,0.15)', backdropFilter: 'blur(12px)' }}
      >
        {/* Quick skill chips */}
        <p className="text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">Quick add:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
            <button
              key={skill}
              onClick={() => addSkill(skill)}
              className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-[rgba(93,254,202,0.4)] hover:text-[#5dfeca] hover:bg-[rgba(93,254,202,0.08)] transition-all flex items-center gap-1"
            >
              <Plus size={10} /> {skill}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input); } }}
            placeholder="Type a skill and press Enter..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[rgba(93,254,202,0.4)]"
          />
          <button
            onClick={() => addSkill(input)}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: 'rgba(93,254,202,0.1)', color: '#5dfeca', border: '1px solid rgba(93,254,202,0.3)' }}
          >
            Add
          </button>
        </div>

        {/* Selected skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <span key={skill} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full text-[#5dfeca] bg-[rgba(93,254,202,0.1)] border border-[rgba(93,254,202,0.3)]">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={!skills.length || loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, rgba(93,254,202,0.2), rgba(93,254,202,0.05))', color: '#5dfeca', border: '1px solid rgba(93,254,202,0.4)' }}
        >
          {loading ? 'Finding matches...' : `🎯 Find matches for ${skills.length} skill${skills.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <SkeletonCard count={3} />
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-gray-400 text-sm mb-4">
                Found <span className="text-white font-semibold">{results.length}</span> matching opportunities
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((opp) => (
                  <OpportunityCard key={opp._id} opportunity={opp} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
              <p>No matches found for your skills. Try adding more skills!</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
