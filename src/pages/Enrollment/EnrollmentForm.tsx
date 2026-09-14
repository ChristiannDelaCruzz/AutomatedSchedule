// src/pages/Enrollment/EnrollmentForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { enrollmentService } from '../../services/enrollment.service';
import { academicService } from '../../services/academic.service';
import type { EnrollmentFormData, SectionCapacity, EnrollmentType } from '../../types/enrollment';
import { ENROLLMENT_TYPES } from '../../types/enrollment';
import type { Department, Program, YearLevel } from '../../types';
import {
  GraduationCap,
  ArrowRight,
  RotateCcw,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';

// ============================================
// ENROLLMENT TYPE ICON MAP
// ============================================
const enrollmentIcons: Record<string, React.ElementType> = {
  GraduationCap,
  ArrowRight,
  RotateCcw,
  ArrowLeftRight,
};

// ============================================
// PREMIUM DATE PICKER
// ============================================
const PremiumDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}> = ({ value, onChange, label, required, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          setSelectedYear(year);
          setSelectedMonth(month);
          setSelectedDay(day);
        }
      }
    }
  }, [value]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 1900; y <= currentYear + 10; y++) {
    years.push(y);
  }

  const handleDateSelect = (day: number, month: number, year: number) => {
    const date = new Date(Date.UTC(year, month, day));
    const formatted = date.toISOString().split('T')[0];
    onChange(formatted);
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    const daysInMonth = getDaysInMonth(selectedYear, month);
    const validDay = Math.min(selectedDay, daysInMonth);
    setSelectedDay(validDay);
    const date = new Date(Date.UTC(selectedYear, month, validDay));
    const formatted = date.toISOString().split('T')[0];
    onChange(formatted);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const day = parseInt(e.target.value);
    setSelectedDay(day);
    const date = new Date(Date.UTC(selectedYear, selectedMonth, day));
    const formatted = date.toISOString().split('T')[0];
    onChange(formatted);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const daysInMonth = getDaysInMonth(year, selectedMonth);
    const validDay = Math.min(selectedDay, daysInMonth);
    setSelectedDay(validDay);
    const date = new Date(Date.UTC(year, selectedMonth, validDay));
    const formatted = date.toISOString().split('T')[0];
    onChange(formatted);
  };

  const displayValue = value ? (() => {
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(Date.UTC(year, month, day));
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        });
      }
    }
    return '';
  })() : '';

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  
  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];
  const prevMonthDays = getDaysInMonth(selectedYear, selectedMonth - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, isCurrentMonth: false });
  }

  const dayOptions: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dayOptions.push(d);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          className={`flex items-center w-full px-5 py-4 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            error ? 'border-error ring-1 ring-error/20' : 
            isFocused || isOpen ? 'ring-4 ring-cyan/10 border-cyan shadow-sm' : 
            'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(true);
          }}
        >
          <svg className="w-5 h-5 text-cyan flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={`flex-1 text-base ${displayValue ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
            {displayValue || 'Select date'}
          </span>
          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border-2 border-slate-200 rounded-xl shadow-2xl shadow-slate-200/50 p-5 animate-fade-in min-w-[360px]">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Month</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-sm font-medium text-slate-700 bg-white hover:border-slate-300 appearance-none cursor-pointer"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Day</label>
                <select
                  value={selectedDay}
                  onChange={handleDayChange}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-sm font-medium text-slate-700 bg-white hover:border-slate-300 appearance-none cursor-pointer"
                >
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-sm font-medium text-slate-700 bg-white hover:border-slate-300 appearance-none cursor-pointer"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">
                  {months[selectedMonth]} {selectedYear}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newMonth = selectedMonth - 1;
                      if (newMonth < 0) {
                        setSelectedMonth(11);
                        setSelectedYear(selectedYear - 1);
                      } else {
                        setSelectedMonth(newMonth);
                      }
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newMonth = selectedMonth + 1;
                      if (newMonth > 11) {
                        setSelectedMonth(0);
                        setSelectedYear(selectedYear + 1);
                      } else {
                        setSelectedMonth(newMonth);
                      }
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {days.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, index) => {
                  const isSelected = selectedDay === item.day && item.isCurrentMonth;
                  const isToday = new Date().getDate() === item.day &&
                    new Date().getMonth() === selectedMonth &&
                    new Date().getFullYear() === selectedYear &&
                    item.isCurrentMonth;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (item.isCurrentMonth) {
                          handleDateSelect(item.day, selectedMonth, selectedYear);
                        }
                      }}
                      className={`
                        text-center py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${item.isCurrentMonth ? 'text-slate-700 cursor-pointer' : 'text-slate-300 cursor-default'}
                        ${isSelected ? 'bg-gradient-to-r from-navy to-navy-dark text-white shadow-md shadow-navy/20 scale-95' : ''}
                        ${isToday && !isSelected ? 'border-2 border-cyan text-cyan font-semibold' : ''}
                        ${!isSelected && !isToday && item.isCurrentMonth ? 'hover:bg-slate-100 hover:scale-105' : ''}
                      `}
                      disabled={!item.isCurrentMonth}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = today.getMonth();
                  const day = today.getDate();
                  const date = new Date(Date.UTC(year, month, day));
                  const formatted = date.toISOString().split('T')[0];
                  onChange(formatted);
                  setSelectedYear(year);
                  setSelectedMonth(month);
                  setSelectedDay(day);
                  setIsOpen(false);
                }}
                className="text-sm font-semibold text-cyan hover:text-cyan-dark transition-colors px-3 py-1.5 hover:bg-cyan/10 rounded-lg"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error animate-fade-in">{error}</p>
      )}
    </div>
  );
};

// ============================================
// ENHANCED NEXT BUTTON
// ============================================
const EnhancedNextButton = ({ onClick, disabled, isLoading, text = "Next Step" }: { onClick: () => void; disabled?: boolean; isLoading?: boolean; text?: string }) => (
  <Button
    onClick={onClick}
    variant="primary"
    size="lg"
    disabled={disabled || isLoading}
    className="group px-8 py-3.5 text-base font-semibold bg-navy hover:bg-navy-dark text-white shadow-lg shadow-navy/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
  >
    {isLoading ? 'Loading...' : (
      <>
        {text}
        <svg className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </>
    )}
  </Button>
);

// ============================================
// ENHANCED BACK BUTTON
// ============================================
const EnhancedBackButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    variant="outline"
    size="lg"
    className="px-8 py-3.5 text-base font-medium border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
  >
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    Back
  </Button>
);

// ============================================
// MAIN ENROLLMENT FORM
// ============================================
export const EnrollmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // step 0 = Type, 1 = Personal, 2 = Academic, 3 = Section, 4 = Review, 5 = Success
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Enrollment Type state
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('new');
  const [previousStudentNumber, setPreviousStudentNumber] = useState('');
  const [studentVerified, setStudentVerified] = useState<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    contactNumber?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Prevent multiple API calls
  const hasLoadedRef = useRef(false);

  // Dropdown data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [sections, setSections] = useState<SectionCapacity[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);

  const [formData, setFormData] = useState<EnrollmentFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      contactNumber: '',
      email: user?.email || '',
      address: '',
    },
    academicInfo: {
      departmentId: '',
      programId: '',
      yearLevelId: '',
      academicYear: '',
      semester: 1,
      sectionId: '',
    },
  });

  const academicYears = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];

  // ============================================
  // VERIFY STUDENT NUMBER
  // ============================================
  const handleVerifyStudent = async () => {
    if (!previousStudentNumber.trim()) {
      setVerifyError('Please enter your student number');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setStudentVerified(null);

    const response = await enrollmentService.verifyStudentNumber(
      previousStudentNumber.trim().toUpperCase()
    );

    if (response.success && response.data) {
      setStudentVerified(response.data);

      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: response.data!.firstName,
          lastName: response.data!.lastName,
          middleName: response.data!.middleName || '',
          contactNumber: response.data!.contactNumber || '',
          email: response.data!.email,
        },
      }));

      showToast('success', 'Verified!', `Welcome back, ${response.data.firstName}!`);
    } else {
      setVerifyError(response.error?.message || 'Student number not found');
    }

    setIsVerifying(false);
  };

  // ============================================
  // LOAD DEPARTMENTS - Runs only once on mount
  // ============================================
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await academicService.getDepartments();
        
        if (response.success && response.data && response.data.length > 0) {
          setDepartments(response.data);
          showToast('success', 'Departments Loaded', `${response.data.length} departments available.`);
        } else {
          setDepartments([]);
          showToast('warning', 'No Departments', 'No departments are available for enrollment.');
        }
      } catch (error: any) {
        showToast('error', 'Failed to Load Departments', error.message || 'Could not load departments.');
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDepartments();

    setFormData((prev) => ({
      ...prev,
      academicInfo: { ...prev.academicInfo, academicYear: '2026-2027', semester: 1 },
    }));
  }, []);

  // ============================================
  // LOAD PROGRAMS
  // ============================================
  useEffect(() => {
    const loadPrograms = async () => {
      const departmentId = formData.academicInfo.departmentId;
      
      if (departmentId) {
        setIsLoading(true);
        try {
          const response = await academicService.getProgramsByDepartment(departmentId);
          if (response.success && response.data) {
            setFilteredPrograms(response.data);
          } else {
            setFilteredPrograms([]);
          }
        } catch (error) {
          setFilteredPrograms([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFilteredPrograms([]);
      }
    };
    loadPrograms();
  }, [formData.academicInfo.departmentId]);

  // ============================================
  // LOAD YEAR LEVELS
  // ============================================
  useEffect(() => {
    const loadYearLevels = async () => {
      const programId = formData.academicInfo.programId;
      
      if (programId) {
        setIsLoading(true);
        try {
          const response = await academicService.getYearLevels(programId);
          if (response.success && response.data) {
            setYearLevels(response.data);
          } else {
            setYearLevels([]);
          }
        } catch (error) {
          setYearLevels([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setYearLevels([]);
      }
    };
    loadYearLevels();
  }, [formData.academicInfo.programId]);

  // ============================================
  // LOAD SECTIONS
  // ============================================
  useEffect(() => {
    const loadSections = async () => {
      if (formData.academicInfo.yearLevelId && formData.academicInfo.programId) {
        setIsLoading(true);
        try {
          const response = await academicService.getSections({
            programId: formData.academicInfo.programId,
            yearLevelId: formData.academicInfo.yearLevelId,
            academicYear: formData.academicInfo.academicYear || '2026-2027',
            semester: formData.academicInfo.semester,
          });
          
          if (response.success && response.data) {
            const sectionCapacity: SectionCapacity[] = response.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              code: s.code,
              max_capacity: s.max_capacity,
              current_enrollment: s.current_enrollment,
              remaining_slots: s.max_capacity - s.current_enrollment,
              status: s.status === 'full' ? 'full' : s.status === 'closed' ? 'closed' : 'open',
            }));
            setSections(sectionCapacity);
          } else {
            setSections([]);
          }
        } catch (error) {
          setSections([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSections([]);
      }
    };
    loadSections();
  }, [formData.academicInfo.programId, formData.academicInfo.yearLevelId, formData.academicInfo.academicYear, formData.academicInfo.semester]);

  // ============================================
  // LOAD COURSES
  // ============================================
  useEffect(() => {
    const loadCourses = async () => {
      if (selectedSectionId && formData.academicInfo.yearLevelId) {
        setIsLoading(true);
        try {
          const curriculumResponse = await academicService.getSemesterCurriculum(
            formData.academicInfo.yearLevelId,
            formData.academicInfo.semester,
            formData.academicInfo.academicYear || '2026-2027'
          );
          if (curriculumResponse.success && curriculumResponse.data) {
            const coursesResponse = await academicService.getCurriculumCourses(curriculumResponse.data.id);
            if (coursesResponse.success && coursesResponse.data) {
              setCourses(coursesResponse.data);
            }
          }
        } catch (error) {
          setCourses([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadCourses();
  }, [selectedSectionId, formData.academicInfo.yearLevelId, formData.academicInfo.semester]);

  // ============================================
  // HANDLERS
  // ============================================
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [e.target.name]: e.target.value } }));
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, dateOfBirth: date },
    }));
  };

  const handleAcademicChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      academicInfo: {
        ...prev.academicInfo,
        [name]: name === 'semester' ? parseInt(value) : value,
      },
    }));
    
    if (name === 'departmentId') {
      setFilteredPrograms([]);
      setYearLevels([]);
      setSections([]);
      setCourses([]);
      setSelectedSectionId('');
      setFormData((prev) => ({
        ...prev,
        academicInfo: {
          ...prev.academicInfo,
          programId: '',
          yearLevelId: '',
          sectionId: '',
        },
      }));
    }
    if (name === 'programId') {
      setYearLevels([]);
      setSections([]);
      setCourses([]);
      setSelectedSectionId('');
      setFormData((prev) => ({
        ...prev,
        academicInfo: {
          ...prev.academicInfo,
          yearLevelId: '',
          sectionId: '',
        },
      }));
    }
    if (name === 'yearLevelId' || name === 'academicYear' || name === 'semester') {
      setSections([]);
      setCourses([]);
      setSelectedSectionId('');
      setFormData((prev) => ({
        ...prev,
        academicInfo: {
          ...prev.academicInfo,
          sectionId: '',
        },
      }));
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setFormData((prev) => ({ ...prev, academicInfo: { ...prev.academicInfo, sectionId: sectionId } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: EnrollmentFormData = {
        ...formData,
        enrollmentType,
        previousStudentNumber:
          enrollmentType === 'continuing' || enrollmentType === 'returnee'
            ? previousStudentNumber
            : undefined,
      };

      const response = await enrollmentService.submitApplication(payload);
      
      if (response.success) {
        showToast(
          'success', 
          'Application Submitted! 🎉', 
          'Your enrollment application has been submitted successfully.'
        );
        setStep(5);
        
        if (response.data?.application) {
          localStorage.setItem('last_application_number', response.data.application.applicationNumber);
          sessionStorage.setItem('enrollment_application_number', response.data.application.applicationNumber);
        }
      } else {
        if (response.error?.code === 'DUPLICATE_APPLICATION') {
          const appNumber = (response.error?.details as any)?.applicationNumber || '';
          showToast(
            'warning', 
            'Application Already Submitted', 
            `You already have a pending application.${appNumber ? ' Application #: ' + appNumber : ''}`
          );
          setStep(5);
        } else {
          showToast(
            'error', 
            'Submission Failed', 
            response.error?.message || 'Please try again or contact the admissions office.'
          );
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      
      if (error.status === 409 || error.code === 'DUPLICATE_APPLICATION') {
        const appNumber = error.data?.applicationNumber || '';
        showToast(
          'warning', 
          'Application Already Submitted', 
          `You already have a pending application.${appNumber ? ' Application #: ' + appNumber : ''}`
        );
        setStep(5);
      } else {
        showToast(
          'error', 
          'Submission Failed', 
          error.message || 'Please try again or contact the admissions office.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const nextStep = () => {
    if (step === 0) {
      if (enrollmentType === 'continuing' || enrollmentType === 'returnee') {
        if (!previousStudentNumber.trim()) {
          showToast('warning', 'Student Number Required', 'Please enter your student number.');
          return;
        }
        if (!studentVerified) {
          showToast('warning', 'Verify Student Number', 'Please click "Verify" first.');
          return;
        }
      }
    }
    if (step === 1) {
      const { firstName, lastName, dateOfBirth, contactNumber, address } = formData.personalInfo;
      if (!firstName || !lastName || !dateOfBirth || !contactNumber || !address) {
        showToast('warning', 'Missing Information', 'Please fill in all required fields.');
        return;
      }
    }
    if (step === 2) {
      const { departmentId, programId, yearLevelId, academicYear } = formData.academicInfo;
      if (!departmentId) {
        showToast('warning', 'Missing Information', 'Please select a department.');
        return;
      }
      if (!programId) {
        showToast('warning', 'Missing Information', 'Please select a program.');
        return;
      }
      if (!yearLevelId) {
        showToast('warning', 'Missing Information', 'Please select a year level.');
        return;
      }
      if (!academicYear) {
        showToast('warning', 'Missing Information', 'Please select an academic year.');
        return;
      }
    }
    if (step === 3) {
      if (!selectedSectionId) {
        showToast('warning', 'No Section Selected', 'Please select a section.');
        return;
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const goToLogin = () => navigate('/login');

  const resetForm = () => {
    setStep(0);
    setSelectedSectionId('');
    setCourses([]);
    setSections([]);
    setFilteredPrograms([]);
    setYearLevels([]);
    setEnrollmentType('new');
    setPreviousStudentNumber('');
    setStudentVerified(null);
    setVerifyError(null);
    setFormData({
      personalInfo: {
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: '',
        contactNumber: '',
        email: user?.email || '',
        address: '',
      },
      academicInfo: {
        departmentId: '',
        programId: '',
        yearLevelId: '',
        academicYear: '2026-2027',
        semester: 1,
        sectionId: '',
      },
    });
  };

  // ============================================
  // RENDER STEP INDICATOR
  // ============================================
  const renderStepIndicator = () => {
  const steps = [
    { label: 'Student Type', shortLabel: 'Type' },
    { label: 'Personal Info', shortLabel: 'Personal' },
    { label: 'Academic Info', shortLabel: 'Academic' },
    { label: 'Select Section', shortLabel: 'Section' },
    { label: 'Review', shortLabel: 'Review' },
  ];

  return (
    <div className="mb-10">
      {/* Desktop / Tablet: Horizontal */}
      <div className="hidden md:flex items-start justify-center">
        {steps.map((item, index) => (
          <React.Fragment key={index}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2 min-w-[90px]">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === index
                      ? 'bg-gradient-to-br from-navy to-navy-dark text-white shadow-lg shadow-navy/30 ring-4 ring-navy/10 scale-110'
                      : step > index
                      ? 'bg-gradient-to-br from-cyan to-cyan-dark text-white shadow-md shadow-cyan/20'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {step > index ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-semibold text-center leading-tight transition-colors ${
                  step === index
                    ? 'text-navy'
                    : step > index
                    ? 'text-cyan-600'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 max-w-[80px] h-0.5 mt-5 mx-2 rounded-full transition-colors duration-300"
                style={{
                  background: step > index 
                    ? 'linear-gradient(90deg, #06B6D4 0%, #155E75 100%)' 
                    : '#E2E8F0'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: Compact pills */}
      <div className="md:hidden">
        {/* Current step highlighted */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy to-navy-dark rounded-full shadow-md">
            <span className="text-xs font-bold text-white">
              Step {step + 1} of {steps.length}
            </span>
            <span className="w-px h-3 bg-white/30" />
            <span className="text-xs font-semibold text-white">{steps[step].label}</span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === index
                  ? 'w-8 bg-gradient-to-r from-navy to-navy-dark'
                  : step > index
                  ? 'w-4 bg-cyan'
                  : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

  // ============================================
  // RENDER STEP CONTENT
  // ============================================
  const renderStep = () => {
    // ============================================
    // STEP 0: STUDENT TYPE
    // ============================================
    if (step === 0) {
      return (
        <div className="space-y-6 animate-slide-in-right">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Welcome! Let's get started</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                First, tell us about your enrollment status.
              </p>
            </div>
          </div>

          {/* Enrollment Type Selector */}
          <div className="space-y-3">
            {ENROLLMENT_TYPES.map((type) => {
              const Icon = enrollmentIcons[type.icon] || GraduationCap;
              const isSelected = enrollmentType === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setEnrollmentType(type.value);
                    setPreviousStudentNumber('');
                    setStudentVerified(null);
                    setVerifyError(null);
                  }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan bg-gradient-to-br from-cyan/5 to-white shadow-lg shadow-cyan/10 ring-2 ring-cyan/20 scale-[1.01]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${type.color} shadow-md`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-bold text-slate-900">{type.label}</p>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-cyan flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Student Number for Continuing/Returnee */}
          {(enrollmentType === 'continuing' || enrollmentType === 'returnee') && (
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 animate-slide-in-right">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan" />
                  Enter your Student Number
                  <span className="text-error">*</span>
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previousStudentNumber}
                  onChange={(e) => {
                    setPreviousStudentNumber(e.target.value.toUpperCase());
                    setStudentVerified(null);
                    setVerifyError(null);
                  }}
                  placeholder="e.g., SP-2026-00001"
                  disabled={!!studentVerified}
                  className="flex-1 px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-slate-900 font-mono uppercase tracking-wider disabled:bg-slate-100 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyStudent}
                  disabled={isVerifying || !!studentVerified || !previousStudentNumber.trim()}
                  className="px-6 py-4 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg shadow-navy/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : studentVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>

              {verifyError && (
                <p className="mt-2 text-sm text-error flex items-center gap-1.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  {verifyError}
                </p>
              )}

              {studentVerified && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                  <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Welcome back, {studentVerified.firstName} {studentVerified.lastName}!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    We've pre-filled your information. Please review and continue.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-6">
            <EnhancedNextButton
              onClick={nextStep}
              disabled={
                (enrollmentType === 'continuing' || enrollmentType === 'returnee') &&
                !studentVerified
              }
            />
          </div>
        </div>
      );
    }

    // ============================================
    // STEP 1: PERSONAL INFO
    // ============================================
    if (step === 1) {
      return (
        <div className="space-y-6 animate-slide-in-right">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-500 mt-0.5">Please provide your personal details.</p>
            </div>
          </div>

          {studentVerified && (
            <div className="p-4 bg-cyan/5 border border-cyan/30 rounded-xl">
              <p className="text-xs text-cyan-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Information pre-filled from your existing account. You can still edit it.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="First Name" name="firstName" value={formData.personalInfo.firstName} onChange={handlePersonalChange} placeholder="Enter your first name" required className="py-4 text-base" />
            <Input label="Last Name" name="lastName" value={formData.personalInfo.lastName} onChange={handlePersonalChange} placeholder="Enter your last name" required className="py-4 text-base" />
          </div>
          <Input label="Middle Name (Optional)" name="middleName" value={formData.personalInfo.middleName} onChange={handlePersonalChange} placeholder="Enter your middle name" className="py-4 text-base" />
          
          <PremiumDatePicker
            label="Date of Birth"
            value={formData.personalInfo.dateOfBirth}
            onChange={handleDateChange}
            required
          />
          
          <Input label="Contact Number" name="contactNumber" value={formData.personalInfo.contactNumber} onChange={handlePersonalChange} placeholder="Enter your contact number" required className="py-4 text-base" />
          <Input label="Email Address" name="email" type="email" value={formData.personalInfo.email} onChange={handlePersonalChange} placeholder="Enter your email address" required disabled={!!user || !!studentVerified} className="py-4 text-base" />
          <Input label="Address" name="address" value={formData.personalInfo.address} onChange={handlePersonalChange} placeholder="Enter your complete address" required className="py-4 text-base" />
          
          <div className="flex justify-between pt-6">
            <EnhancedBackButton onClick={prevStep} />
            <EnhancedNextButton onClick={nextStep} />
          </div>
        </div>
      );
    }

    // ============================================
    // STEP 2: ACADEMIC INFO
    // ============================================
    if (step === 2) {
      return (
        <div className="space-y-6 animate-slide-in-right">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Academic Information</h3>
              <p className="text-sm text-slate-500 mt-0.5">Select your department, program, and year level.</p>
            </div>
          </div>
          <div className="space-y-5">
            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Department <span className="text-error ml-1">*</span>
              </label>
              <select
                value={formData.academicInfo.departmentId || ''}
                onChange={handleAcademicChange}
                name="departmentId"
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-slate-900 appearance-none"
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {departments.length === 0 && !isLoading && (
                <p className="mt-1.5 text-sm text-amber-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                  </svg>
                  No departments available. Please contact the administrator.
                </p>
              )}
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Program <span className="text-error ml-1">*</span>
              </label>
              <select
                value={formData.academicInfo.programId || ''}
                onChange={handleAcademicChange}
                name="programId"
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-slate-900 appearance-none"
                disabled={!formData.academicInfo.departmentId || isLoading}
              >
                <option value="">Select Program</option>
                {filteredPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} ({program.code})
                  </option>
                ))}
              </select>
              {!formData.academicInfo.departmentId && (
                <p className="mt-1.5 text-sm text-slate-400">Please select a department first.</p>
              )}
              {formData.academicInfo.departmentId && filteredPrograms.length === 0 && !isLoading && (
                <p className="mt-1.5 text-sm text-amber-600">No programs found for this department.</p>
              )}
            </div>

            {/* Year Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Year Level <span className="text-error ml-1">*</span>
              </label>
              <select
                value={formData.academicInfo.yearLevelId || ''}
                onChange={handleAcademicChange}
                name="yearLevelId"
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-slate-900 appearance-none"
                disabled={!formData.academicInfo.programId || isLoading}
              >
                <option value="">Select Year Level</option>
                {yearLevels.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
              {!formData.academicInfo.programId && (
                <p className="mt-1.5 text-sm text-slate-400">Please select a program first.</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Academic Year <span className="text-error ml-1">*</span>
              </label>
              <select
                value={formData.academicInfo.academicYear || ''}
                onChange={handleAcademicChange}
                name="academicYear"
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-slate-900 appearance-none"
                disabled={isLoading}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Semester <span className="text-error ml-1">*</span>
              </label>
              <select
                value={formData.academicInfo.semester}
                onChange={handleAcademicChange}
                name="semester"
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all duration-200 text-slate-900 appearance-none"
                disabled={isLoading}
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <EnhancedBackButton onClick={prevStep} />
            <EnhancedNextButton onClick={nextStep} />
          </div>
        </div>
      );
    }

    // ============================================
    // STEP 3: SELECT SECTION
    // ============================================
    if (step === 3) {
      return (
        <div className="space-y-6 animate-slide-in-right">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Select Section</h3>
              <p className="text-sm text-slate-500 mt-0.5">Choose your preferred section.</p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-navy border-t-cyan rounded-full animate-spin" />
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-slate-500 font-medium text-lg">No sections available</p>
              <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">No sections are currently available for your selected program, year level, and semester.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionSelect(section.id)}
                  className={`p-5 border-2 rounded-xl text-left transition-all duration-300 ${
                    selectedSectionId === section.id
                      ? 'border-cyan bg-gradient-to-br from-cyan/5 to-cyan/10 shadow-lg shadow-cyan/10 ring-2 ring-cyan/20 scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  } ${section.status === 'full' || section.status === 'closed' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={section.status === 'full' || section.status === 'closed'}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-lg">{section.name}</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      section.status === 'open' ? 'bg-green-100 text-green-700' : section.status === 'full' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {section.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5">{section.current_enrollment} / {section.max_capacity} students</p>
                  {section.remaining_slots > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan to-navy rounded-full transition-all duration-500" style={{ width: `${(section.current_enrollment / section.max_capacity) * 100}%` }} />
                      </div>
                      <span className="text-xs text-cyan font-semibold">{section.remaining_slots} slots left</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {selectedSectionId && courses.length > 0 && (
            <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Semester Courses ({courses.length})
              </h4>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700">{course.subject.code} - {course.subject.name}</span>
                    <span className="text-slate-400 font-medium">{course.subject.units} units</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t-2 border-slate-200 flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Total Units</span>
                <span className="text-navy text-lg">{courses.reduce((sum, c) => sum + c.subject.units, 0)}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-6">
            <EnhancedBackButton onClick={prevStep} />
            <EnhancedNextButton onClick={nextStep} disabled={!selectedSectionId} />
          </div>
        </div>
      );
    }

    // ============================================
    // STEP 4: REVIEW
    // ============================================
    if (step === 4) {
      const selectedType = ENROLLMENT_TYPES.find((t) => t.value === enrollmentType);

      return (
        <div className="space-y-6 animate-slide-in-right">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Review Your Application</h3>
              <p className="text-sm text-slate-500 mt-0.5">Please review your information before submitting.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Enrollment Type */}
            <div className="p-5 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-200">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-cyan" />
                </div>
                Enrollment Type
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-500">Type:</span>{' '}
                  <span className="font-semibold text-slate-900">{selectedType?.label}</span>
                </p>
                {(enrollmentType === 'continuing' || enrollmentType === 'returnee') && (
                  <p>
                    <span className="text-slate-500">Student Number:</span>{' '}
                    <span className="font-mono font-semibold text-slate-900">{previousStudentNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><span className="text-slate-500">Name:</span> <span className="text-slate-800 font-medium">{formData.personalInfo.firstName} {formData.personalInfo.lastName}</span></p>
                <p><span className="text-slate-500">Email:</span> <span className="text-slate-800">{formData.personalInfo.email}</span></p>
                <p><span className="text-slate-500">Contact:</span> <span className="text-slate-800">{formData.personalInfo.contactNumber}</span></p>
                <p><span className="text-slate-500">DOB:</span> <span className="text-slate-800">{formData.personalInfo.dateOfBirth}</span></p>
              </div>
            </div>

            {/* Academic Info */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Academic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><span className="text-slate-500">Department:</span> <span className="text-slate-800 font-medium">{departments.find(d => d.id === formData.academicInfo.departmentId)?.name || 'Not selected'}</span></p>
                <p><span className="text-slate-500">Program:</span> <span className="text-slate-800 font-medium">{filteredPrograms.find(p => p.id === formData.academicInfo.programId)?.name || 'Not selected'}</span></p>
                <p><span className="text-slate-500">Year Level:</span> <span className="text-slate-800">{yearLevels.find(y => y.id === formData.academicInfo.yearLevelId)?.name || 'Not selected'}</span></p>
                <p><span className="text-slate-500">Academic Year:</span> <span className="text-slate-800">{formData.academicInfo.academicYear}</span></p>
                <p><span className="text-slate-500">Semester:</span> <span className="text-slate-800">{formData.academicInfo.semester === 1 ? '1st' : '2nd'} Semester</span></p>
                <p><span className="text-slate-500">Section:</span> <span className="text-slate-800 font-medium">{sections.find(s => s.id === selectedSectionId)?.name || 'Not selected'}</span></p>
              </div>
            </div>

            {/* Courses */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Courses ({courses.length})
              </h4>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700">{course.subject.code} - {course.subject.name}</span>
                    <span className="text-slate-400 font-medium">{course.subject.units} units</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t-2 border-slate-200 flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Total Units</span>
                <span className="text-navy text-lg">{courses.reduce((sum, c) => sum + c.subject.units, 0)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <EnhancedBackButton onClick={prevStep} />
            <Button onClick={handleSubmit} variant="primary" size="lg" isLoading={isSubmitting} disabled={isSubmitting} className="px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-cyan to-cyan-dark hover:from-cyan-dark hover:to-cyan shadow-lg shadow-cyan/20 hover:shadow-xl hover:shadow-cyan/30 transition-all duration-300">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      );
    }

    // ============================================
    // STEP 5: SUCCESS
    // ============================================
    if (step === 5) {
      return (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center shadow-2xl shadow-green-500/20">
            <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">Application Submitted! 🎉</h3>
          <p className="text-slate-500 mt-4 max-w-sm mx-auto text-lg">Your enrollment application has been submitted successfully.</p>
          <p className="text-sm text-slate-400 mt-2">You will receive an email once your application is reviewed.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg" className="px-8 py-3.5 text-base">Go to Dashboard</Button>
            ) : (
              <Button onClick={goToLogin} variant="primary" size="lg" className="px-8 py-3.5 text-base">Go to Login</Button>
            )}
            <Button onClick={resetForm} variant="outline" size="lg" className="px-8 py-3.5 text-base">
              Submit Another Application
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const semesterLabel = formData.academicInfo.semester === 1 ? '1st Semester' : '2nd Semester';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Enrollment Application</h1>
            <p className="text-slate-500 mt-1">Academic Year {formData.academicInfo.academicYear || '2026-2027'} • {semesterLabel}</p>
          </div>
          {!isAuthenticated && (
            <Button onClick={goToLogin} variant="outline" size="sm" className="text-sm px-5 py-2.5">
              Sign In
            </Button>
          )}
        </div>

        <Card className="p-8 sm:p-10 lg:p-12 shadow-xl shadow-slate-200/50 border-slate-200/60 rounded-2xl">
          {step < 5 && renderStepIndicator()}
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentForm;