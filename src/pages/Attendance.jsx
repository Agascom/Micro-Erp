import { useState, useEffect, useMemo } from 'react';
import attendanceService from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import { useToast } from '../contexts/ToastContext';

const Attendance = () => {
    const { addToast } = useToast();
    const [attendances, setAttendances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Default mode is 'daily' (existing view). 'report' is the new monthly report view.
    const [viewMode, setViewMode] = useState('daily'); 

    // Filters for Daily View
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyEmployeeId, setDailyEmployeeId] = useState('');

    // Filters for Report View
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7)); // YYYY-MM
    const [reportEmployeeId, setReportEmployeeId] = useState('');

    const [submitting, setSubmitting] = useState(false);

    // Form data for manual entry
    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        status: 'present'
    });

    useEffect(() => {
        if (viewMode === 'daily') {
            fetchDailyData();
        } else {
            fetchReportData();
        }
    }, [filterDate, viewMode, reportMonth, reportEmployeeId, dailyEmployeeId]);

    /* Load Daily Data */
    const fetchDailyData = async () => {
        setLoading(true);
        try {
            const params = { date: filterDate };
            if (dailyEmployeeId) params.employee_id = dailyEmployeeId;

            const [attRes, empRes] = await Promise.all([
                attendanceService.getAttendances(params),
                employeeService.getAll()
            ]);
            setAttendances(attRes.data || attRes || []);
            setEmployees(Array.isArray(empRes) ? empRes : (empRes?.data || []));
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des données.');
            addToast('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    /* Load Report Data - fetches range of dates */
    const fetchReportData = async () => {
        // Only fetch if in report mode
        if (viewMode !== 'report') return;
        
        setLoading(true);
        try {
            // Fetch employees if not already loaded
            if (employees.length === 0) {
                 const empRes = await employeeService.getAll();
                 setEmployees(Array.isArray(empRes) ? empRes : (empRes?.data || []));
            }

            // Calculate start and end of selected month
            const [year, month] = reportMonth.split('-');
            const startDate = `${year}-${month}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${month}-${lastDay}`;

            // API call - assuming backend supports date_from and date_to parameters
            // If reportEmployeeId is set, filter by it
            const params = {
                date_from: startDate,
                date_to: endDate
            };
            if (reportEmployeeId) {
                params.employee_id = reportEmployeeId;
            }

            const attRes = await attendanceService.getAttendances(params);
            setAttendances(attRes.data || attRes || []);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement du rapport.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await attendanceService.createAttendance(formData);
            setShowModal(false);
            setFormData({
                employee_id: '',
                date: new Date().toISOString().split('T')[0],
                check_in: '',
                check_out: '',
                status: 'present'
            });
            if (viewMode === 'daily') fetchDailyData(); else fetchReportData();
            addToast('Pointage enregistré avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
            addToast('Erreur lors de l\'enregistrement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate report stats
    const reportStats = useMemo(() => {
        if (!attendances.length) return { present: 0, absent: 0, late: 0, totalHours: 0 };
        
        let present = 0;
        let absent = 0;
        let late = 0;
        let totalHours = 0;

        attendances.forEach(att => {
            if (att.status === 'present') present++;
            if (att.status === 'absent') absent++;
            if (att.status === 'late') late++;

            if (att.check_in && att.check_out) {
                const [h1, m1] = att.check_in.split(':');
                const [h2, m2] = att.check_out.split(':');
                const d1 = new Date(0, 0, 0, h1, m1);
                const d2 = new Date(0, 0, 0, h2, m2);
                let diff = (d2 - d1) / (1000 * 60 * 60);
                if (diff < 0) diff += 24; // Handle overnight shifts if needed
                if (diff > 0) totalHours += diff;
            }
        });

        return { present, absent, late, totalHours: totalHours.toFixed(2) };
    }, [attendances]);


    const getEmployeeName = (userId) => {
        const emp = employees.find(e => e.id == userId || e.user_id == userId);
        return emp 
            ? (emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`)
            : 'Inconnu';
    };

    if (loading && attendances.length === 0 && employees.length === 0) {
         return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                     <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>RH</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Présences</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Suivi des Présences</h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Switcher */}
                     <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Journalier
                        </button>
                        <button
                            onClick={() => setViewMode('report')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'report' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Rapport Mensuel
                        </button>
                    </div>

                    {/* Filters based on View Mode */}
                    {viewMode === 'daily' ? (
                        <>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">calendar_today</span>
                            </div>
                            <div className="relative w-48">
                                <select 
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm appearance-none"
                                    value={dailyEmployeeId}
                                    onChange={(e) => setDailyEmployeeId(e.target.value)}
                                >
                                    <option value="">Tous les employés</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name || (emp.first_name || emp.last_name ? `${emp.first_name || ''} ${emp.last_name || ''}` : `Employé #${emp.id}`)}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">person</span>
                                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-lg pointer-events-none">expand_more</span>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="relative">
                                <input 
                                    type="month" 
                                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                                    value={reportMonth}
                                    onChange={(e) => setReportMonth(e.target.value)}
                                />
                                 <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">date_range</span>
                            </div>
                            <div className="relative w-48">
                                <select 
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm appearance-none"
                                    value={reportEmployeeId}
                                    onChange={(e) => setReportEmployeeId(e.target.value)}
                                >
                                    <option value="">Tous les employés</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name || (emp.first_name || emp.last_name ? `${emp.first_name || ''} ${emp.last_name || ''}` : `Employé #${emp.id}`)}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">person</span>
                                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-lg pointer-events-none">expand_more</span>
                            </div>
                        </>
                    )}

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-purple-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span className="hidden sm:inline">Nouveau</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 rounded-full p-1">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            )}

            {/* Stats Cards for Report Mode */}
            {viewMode === 'report' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                             <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Heures Totales</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{reportStats.totalHours} h</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                             <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Présences</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{reportStats.present} jours</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                             <span className="material-symbols-outlined">timer</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Retards</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{reportStats.late} fois</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                             <span className="material-symbols-outlined">cancel</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Absences</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{reportStats.absent} jours</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employé</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Arrivée</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Départ</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Heures</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {attendances.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
                                            <p>Aucune donnée trouvée pour cette période</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                attendances.map((att) => {
                                    // Calculate hours logic
                                    let hoursWorked = '--';
                                    if (att.check_in && att.check_out) {
                                        const [h1, m1] = att.check_in.split(':');
                                        const [h2, m2] = att.check_out.split(':');
                                        const d1 = new Date(0, 0, 0, h1, m1);
                                        const d2 = new Date(0, 0, 0, h2, m2);
                                        let diff = (d2 - d1) / (1000 * 60 * 60); 
                                        if (diff < 0) diff += 24;
                                        if (diff > 0) hoursWorked = diff.toFixed(2) + ' h';
                                    }

                                    const employeeName = att.employee?.name || att.employee?.first_name 
                                        ? `${att.employee.first_name || ''} ${att.employee.last_name || ''}`.trim() || att.employee.name 
                                        : getEmployeeName(att.employee_id || att.user_id);
                                    
                                    const dateObj = new Date(att.date);
                                    const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

                                    return (
                                        <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-slate-900 dark:text-white font-medium capitalize text-sm">
                                                {formattedDate}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                                    {employeeName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-emerald-600">
                                                {att.check_in ? att.check_in.substring(0, 5) : '--:--'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-red-500">
                                                {att.check_out ? att.check_out.substring(0, 5) : '--:--'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-blue-600 font-bold">
                                                {hoursWorked}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                                    att.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                    att.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                    att.status === 'late' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {att.status === 'present' ? 'Présent' : 
                                                     att.status === 'late' ? 'Retard' : 
                                                     att.status === 'absent' ? 'Absent' : att.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Manual Entry */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-slide-in">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Nouveau Pointage
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-1 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Employee Select */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employé</label>
                                <select
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                >
                                    <option value="">Sélectionner un employé</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name && emp.last_name 
                                                ? `${emp.first_name} ${emp.last_name}` 
                                                : emp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>

                            {/* Times */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Arrivée</label>
                                    <input
                                        type="time"
                                        value={formData.check_in}
                                        onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Départ</label>
                                    <input
                                        type="time"
                                        value={formData.check_out}
                                        onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Statut</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                >
                                    <option value="present">Présent</option>
                                    <option value="late">En retard</option>
                                    <option value="absent">Absent</option>
                                    <option value="excused">Excusé</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-70"
                                >
                                    {submitting ? '...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
