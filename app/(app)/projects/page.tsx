"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus, ExternalLink, Clock } from 'lucide-react';
import { sanitizeText } from '@/lib/sanitize';

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCreatedAt = (value: Date | { toDate?: () => Date } | undefined) => {
    if (!value) return '';
    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().toLocaleDateString();
    }
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === "string" || typeof value === "number") return new Date(value).toLocaleDateString();
    return "";
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'projects'),
          where('freelancerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1C1C]">All Projects</h1>
          <p className="text-[#8B8680]">Manage your active and completed collaborations.</p>
        </div>
        <Button onClick={() => router.push('/projects/new')} className="gap-2">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#8B8680]">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white border border-dashed border-[#D4CFCA] rounded-2xl">
          <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mx-auto">
            <FolderKanban className="w-8 h-8 text-[#8B8680]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#1C1C1C]">No projects yet</h3>
            <p className="text-sm text-[#8B8680]">Create your first project to start receiving payments.</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/projects/new')}>
            Start First Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-[#D4CFCA] p-6 rounded-2xl hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-[#1C1C1C] text-lg group-hover:text-blue-600 transition-colors">
                  {sanitizeText(p.title)}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {p.status}
                </span>
              </div>
              
              <p className="text-sm text-[#8B8680] line-clamp-2 mb-6 h-10">
                {sanitizeText(p.description)}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-[#F5F2ED]">
                <div className="flex items-center gap-2 text-[#8B8680] text-xs">
                  <Clock className="w-3 h-3" />
                  {formatCreatedAt(p.createdAt)}
                </div>
                <div className="font-bold text-[#1C1C1C]">
                  ${p.totalAmount}
                </div>
              </div>
              
              <button 
                onClick={() => router.push(`/dashboard`)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#1C1C1C] hover:bg-[#F5F2ED] rounded-lg transition-colors border border-transparent hover:border-[#D4CFCA]"
              >
                View Details <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
