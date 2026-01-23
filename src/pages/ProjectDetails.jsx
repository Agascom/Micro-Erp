import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { employeeService } from '../services/employeeService';
import { useToast } from '../contexts/ToastContext';

const ProjectDetails = () => {
    const { addToast } = useToast();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [taskForm, setTaskForm] = useState({
        project_id: id,
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'todo', // todo, in_progress, done
        priority: 'medium' // low, medium, high
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projRes, taskRes, empRes] = await Promise.all([
                projectService.getById(id),
                taskService.getAll({ project_id: id }),
                employeeService.getAll()
            ]);
            setProject(projRes.data || projRes);
            setTasks(taskRes.data || taskRes || []);
            setEmployees(empRes.data || empRes || []);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les détails du projet.');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingTask) {
                await taskService.update(editingTask.id, { ...taskForm, project_id: id });
                addToast('Tâche mise à jour avec succès', 'success');
            } else {
                await taskService.create({ ...taskForm, project_id: id });
                addToast('Tâche créée avec succès', 'success');
            }
            setShowTaskModal(false);
            setEditingTask(null);
            setTaskForm({
                project_id: id,
                title: '',
                description: '',
                assigned_to: '',
                due_date: '',
                status: 'todo',
                priority: 'medium'
            });
            // Refresh tasks
            const taskRes = await taskService.getAll({ project_id: id });
            setTasks(taskRes.data || taskRes || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la tâche.');
            addToast('Erreur lors de l\'enregistrement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
        try {
            await taskService.delete(taskId);
            const taskRes = await taskService.getAll({ project_id: id });
            setTasks(taskRes.data || taskRes || []);
            addToast('Tâche supprimée', 'info');
        } catch (err) {
            console.error(err);
            addToast('Impossible de supprimer la tâche', 'error');
        }
    };

    const openTaskModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setTaskForm({
                project_id: id,
                title: task.title,
                description: task.description || '',
                assigned_to: task.assigned_to || '',
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                status: task.status,
                priority: task.priority
            });
        } else {
            setEditingTask(null);
            setTaskForm({
                project_id: id,
                title: '',
                description: '',
                assigned_to: '',
                due_date: '',
                status: 'todo',
                priority: 'medium'
            });
        }
        setShowTaskModal(true);
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
            setTasks(updatedTasks);
            await taskService.updateStatus(taskId, newStatus);
        } catch (err) {
            console.error('Failed to update status', err);
            // Revert on error (could refetch)
            fetchData();
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            default: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
        }
    };

    const getEmployeeName = (empId) => {
        const emp = employees.find(e => e.id == empId);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'Non assigné';
    };

    if (loading) {
         return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!project) return <div className="p-8 text-center text-slate-500">Projet introuvable</div>;

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                     <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Gestion de Projets</span>
                        <span>/</span>
                        <a href="/projects" className="hover:text-purple-600 transition-colors">Liste</a>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Détails</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        {project.name}
                        <span className={`text-xs px-2.5 py-1 rounded-lg uppercase tracking-wide ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {project.status === 'completed' ? 'Terminé' : 'En cours'}
                        </span>
                    </h2>
                </div>
                
                <button
                    onClick={() => openTaskModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">add_task</span>
                    Nouvelle Tâche
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-w-[800px]">
                    
                    {/* Column: To Do */}
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-inherit rounded-t-2xl z-10">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                À Faire
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {todoTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    getPriorityColor={getPriorityColor} 
                                    getEmployeeName={getEmployeeName}
                                    onStatusChange={(id) => handleStatusChange(id, 'in_progress')}
                                    nextLabel="Commencer"
                                    nextIcon="play_arrow"
                                    onEdit={() => openTaskModal(task)}
                                    onDelete={() => handleDeleteTask(task.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-inherit rounded-t-2xl z-10">
                            <h3 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                En Cours
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {inProgressTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    getPriorityColor={getPriorityColor} 
                                    getEmployeeName={getEmployeeName}
                                    onStatusChange={(id) => handleStatusChange(id, 'done')}
                                    nextLabel="Terminer"
                                    nextIcon="check"
                                    prevAction={() => handleStatusChange(task.id, 'todo')}
                                    onEdit={() => openTaskModal(task)}
                                    onDelete={() => handleDeleteTask(task.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Column: Done */}
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-inherit rounded-t-2xl z-10">
                            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Terminé
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full">{doneTasks.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {doneTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    getPriorityColor={getPriorityColor} 
                                    getEmployeeName={getEmployeeName}
                                    isDone={true}
                                    prevAction={() => handleStatusChange(task.id, 'in_progress')}
                                    onEdit={() => openTaskModal(task)}
                                    onDelete={() => handleDeleteTask(task.id)}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Create Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg scale-100 animate-scaleIn">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
                            </h3>
                            <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Titre</label>
                                <input
                                    type="text"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Ex: Maquette Homepage"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priorité</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    >
                                        <option value="low">Basse</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigné à</label>
                                    <select
                                        value={taskForm.assigned_to}
                                        onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    >
                                        <option value="">Non assigné</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Échéance</label>
                                <input
                                    type="date"
                                    value={taskForm.due_date}
                                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all h-24 resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-70"
                                >
                                    {submitting ? 'Enregistrement...' : (editingTask ? 'Mettre à jour' : 'Créer Tâche')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for Task Card
const TaskCard = ({ task, getPriorityColor, getEmployeeName, onStatusChange, nextLabel, nextIcon, isDone, prevAction, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative">
        <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'Urgent' : task.priority === 'low' ? 'Faible' : 'Moyen'}
            </span>
             <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                {prevAction && (
                    <button onClick={prevAction} className="text-slate-400 hover:text-slate-600 p-1" title="Retour">
                        <span className="material-symbols-outlined text-sm">undo</span>
                    </button>
                )}
                <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 p-1" title="Modifier">
                     <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onClick={onDelete} className="text-slate-400 hover:text-red-600 p-1" title="Supprimer">
                     <span className="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{task.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5" title="Assigné à">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {task.assigned_to ? getEmployeeName(task.assigned_to).charAt(0) : '?'}
                </div>
                <span className="text-xs text-slate-500 truncate max-w-[80px]">
                    {task.assigned_to ? getEmployeeName(task.assigned_to).split(' ')[0] : 'Personne'}
                </span>
            </div>
            
            {!isDone ? (
                <button 
                    onClick={() => onStatusChange(task.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2 py-1 rounded-lg transition-colors"
                >
                    {nextLabel}
                    <span className="material-symbols-outlined text-sm">{nextIcon}</span>
                </button>
            ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Fait
                </span>
            )}
        </div>
    </div>
);

export default ProjectDetails;
