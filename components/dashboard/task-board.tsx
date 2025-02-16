'use client'
import React, { useState, useEffect } from 'react'
import { Plus, MoreVertical, Calendar, X, Check, Wallet, Edit, LogOut } from 'lucide-react'
import { Dialog } from '@mui/material'
import { useToast } from '../ui/use-toast'
import DatePicker from 'react-datepicker'
import { connectWallet } from '../../lib/web3'
import "react-datepicker/dist/react-datepicker.css"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Image from 'next/image'
import { Avatar } from '../ui/avatar'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'

interface Task {
  id: string
  title: string
  details?: string
  dueDate?: string
  listId: string
  completed?: boolean
  userId: string
}

interface TaskList {
  id: string
  name: string
  userId: string
}

interface PicsumResponse {
  id: string
  author: string
  download_url: string
}

export function TaskBoard() {
  const { user, logout } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [taskLists, setTaskLists] = React.useState<TaskList[]>([])
  const [selectedList, setSelectedList] = React.useState<string>('1')
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [newTask, setNewTask] = React.useState({
    title: '',
    details: '',
    dueDate: '',
    listId: '1'
  })
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const { toast } = useToast()
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [walletAddress, setWalletAddress] = React.useState('')
  const [listOptionsOpen, setListOptionsOpen] = React.useState(false)
  const [selectedListId, setSelectedListId] = React.useState<string>('')
  const [newListName, setNewListName] = React.useState('')
  const [profileImage, setProfileImage] = React.useState<string>('')
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const router = useRouter()
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const isTaskValid = newTask.title.trim() && newTask.details.trim() && newTask.dueDate
  const hasOtherLists = taskLists.length > 1
  const availableLists = taskLists.filter(list => list.id !== selectedList)

  useEffect(() => {
    if (!user) return

    // Listen for task lists
    const listsQuery = query(
      collection(db, 'taskLists'),
      where('userId', '==', user.uid)
    )
    
    const unsubLists = onSnapshot(listsQuery, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TaskList[]
      setTaskLists(lists)
    })

    // Listen for tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid)
    )
    
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      setTasks(tasks)
    })

    return () => {
      unsubLists()
      unsubTasks()
    }
  }, [user])

  const handleConnectWallet = async () => {
    try {
      if (!window?.ethereum) throw new Error("No ethereum wallet found");
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setWalletAddress(accounts[0])
      toast({
        title: "Wallet connected successfully",
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "Failed to connect wallet",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const handleDisconnectWallet = () => {
    setWalletAddress('')
    toast({
      title: "Wallet disconnected",
      duration: 2000
    })
  }

  const handleSaveTask = async () => {
    if (!user || !newTask.title || !newTask.listId) return
    
    try {
      // Close dialog immediately before the async operation
      setOpen(false)
      
      // Add task to database
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        completed: false,
        userId: user.uid,
        createdAt: new Date().toISOString()
      })

      // Reset form after successful save
      setNewTask({
        title: '',
        details: '',
        dueDate: '',
        listId: ''
      })

      // Show success notification
      toast({
        title: "Task added successfully",
        duration: 2000
      })
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Failed to add task",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const handleMoveTask = async (taskId: string, newListId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        listId: newListId
      })
      setTaskDialogOpen(false)
      toast({
        title: "Task moved successfully",
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "Failed to move task",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const handleAddList = async () => {
    if (!user) return
    try {
      await addDoc(collection(db, 'taskLists'), {
        name: `New List ${taskLists.length + 1}`,
        userId: user.uid,
        createdAt: new Date().toISOString()
      })
      toast({
        title: "List added successfully",
        duration: 2000
      })
    } catch (error) {
      console.error('Error adding list:', error)
      toast({
        title: "Failed to add list",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const handleMarkCompleted = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        completed: true
      })
      toast({
        title: "Task marked as completed",
        duration: 2000
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Failed to update task",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const handleRemoveList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'taskLists', listId))
      // Also delete all tasks in this list
      const tasksQuery = query(collection(db, 'tasks'), where('listId', '==', listId))
      const tasksDocs = await getDocs(tasksQuery)
      tasksDocs.forEach(async (taskDoc) => {
        await deleteDoc(doc(db, 'tasks', taskDoc.id))
      })
      toast({
        title: "List removed successfully",
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "Failed to remove list",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const handleRenameList = (listId: string, newName: string) => {
    if (!newName.trim()) return
    setTaskLists(taskLists.map(list => 
      list.id === listId ? { ...list, name: newName } : list
    ))
    setListOptionsOpen(false)
    toast({
      title: "List renamed successfully",
      duration: 2000
    })
  }

  const handleTaskOptionsClick = (task: Task) => {
    setSelectedTask(task)
    setTaskDialogOpen(true)
  }

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    e.stopPropagation()
    handleMarkCompleted(taskId)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
      toast({
        title: "Logged out successfully",
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "Failed to logout",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const randomId = Math.floor(Math.random() * 1000)
        const response = await fetch(`https://picsum.photos/id/${randomId}/info`)
        const data = await response.json()
        setProfileImage(data.download_url)
      } catch (error) {
        console.error('Failed to fetch profile image:', error)
      }
    }
    fetchProfileImage()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-blue-900 h-16 z-50">
        <div className="max-w-screen-xl mx-auto px-4 h-full flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center gap-2">
            <Brain className="text-white w-8 h-8" />
            <span className="text-white text-xl font-semibold">TasksBoard</span>
          </div>

          {/* Right side - Updated buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setWalletDialogOpen(true)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              <Wallet className="w-5 h-5" />
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>

            <div className="flex items-center gap-3">
              <span className="text-white">{user?.displayName}</span>
              <button 
                onClick={() => setProfileDialogOpen(true)}
                className="rounded-full overflow-hidden w-10 h-10 border-2 border-white"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-800 flex items-center justify-center text-white">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Dialog */}
      <Dialog 
        open={walletDialogOpen} 
        onClose={() => setWalletDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-blue-900">Wallet Options</h3>
            <button onClick={() => setWalletDialogOpen(false)}>
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <button
            onClick={() => {
              walletAddress ? handleDisconnectWallet() : handleConnectWallet();
              setWalletDialogOpen(false);
            }}
            className="w-full p-3 bg-blue-900 text-white rounded hover:bg-blue-800"
          >
            {walletAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
        </div>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-blue-900">Profile Options</h3>
            <button onClick={() => setProfileDialogOpen(false)}>
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <button
            onClick={() => {
              setProfileDialogOpen(false);
              setLogoutDialogOpen(true);
            }}
            className="w-full flex items-center gap-2 p-3 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </Dialog>

      {/* Main content with proper spacing from header */}
      <div className="pt-20 px-6">
        <div className="mt-20 flex gap-8">
          {taskLists.map(list => (
            <div key={list.id} className="w-80 bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-900">{list.name}</h2>
                <button 
                  onClick={() => {
                    setSelectedListId(list.id)
                    setNewListName(list.name)
                    setListOptionsOpen(true)
                  }}
                >
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>

              <button 
                className="flex items-center gap-2 text-blue-900 mb-4"
                onClick={() => {
                  setNewTask({ ...newTask, listId: list.id })
                  setOpen(true)
                }}
              >
                <Plus size={20} className="bg-blue-900 text-white rounded-full p-1" />
                <span>Add a task</span>
              </button>

              {tasks.filter(task => task.listId === list.id && !task.completed).length > 0 && (
                <div className="space-y-3 mb-6">
                  {tasks
                    .filter(task => task.listId === list.id && !task.completed)
                    .map((task) => (
                      <div 
                        key={task.id} 
                        className="border rounded-lg p-3 cursor-pointer"
                        onClick={(e) => {
                          setSelectedTask(task)
                          setTaskDialogOpen(true)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 border-2 border-blue-900 rounded-full"
                              checked={task.completed}
                              onChange={(e) => handleCheckboxClick(e, task.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <h3 className="text-blue-900 font-medium">{task.title}</h3>
                              <p className="text-sm text-gray-600">{task.details}</p>
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                  <Calendar size={14} />
                                  <span>{task.dueDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={(e) => {
                            e.stopPropagation()
                            handleTaskOptionsClick(task)
                          }}>
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Completed Tasks Section */}
              {tasks.filter(task => task.listId === list.id && task.completed).length > 0 && (
                <>
                  <h3 className="text-green-600 font-medium mb-3">
                    Completed ({tasks.filter(task => task.listId === list.id && task.completed).length})
                  </h3>
                  <div className="space-y-3">
                    {tasks
                      .filter(task => task.listId === list.id && task.completed)
                      .map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                          <span className="text-green-600">{task.title}</span>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit Task Dialog */}
        <Dialog 
          open={open} 
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-blue-900">Add Task</h3>
              <button onClick={() => setOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Task title"
              className="text-xl font-semibold text-blue-900 border-b-2 focus:outline-none focus:border-blue-900 w-full"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            
            <textarea 
              placeholder="Add details"
              className="mt-2 w-full p-2 bg-gray-50 rounded-md"
              rows={4}
              value={newTask.details}
              onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
            />
            
            <div className="space-y-2 mt-4">
              <button 
                className="flex items-center gap-2 text-blue-900"
                onClick={() => setDatePickerOpen(true)}
              >
                <Calendar size={16} />
                <span>
                  {newTask.dueDate ? new Date(newTask.dueDate).toLocaleDateString() : 'Add date'}
                </span>
              </button>
              {datePickerOpen && (
                <DatePicker
                  selected={newTask.dueDate ? new Date(newTask.dueDate) : new Date()}
                  onChange={(date) => {
                    setNewTask({ 
                      ...newTask, 
                      dueDate: date ? date.toISOString().split('T')[0] : '' 
                    })
                    setDatePickerOpen(false)
                  }}
                  minDate={new Date()}
                  inline
                />
              )}
            </div>

            <button
              className={`mt-4 w-full py-2 rounded-md ${
                isTaskValid 
                  ? 'bg-blue-900 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleSaveTask}
              disabled={!isTaskValid}
            >
              Save Task
            </button>
          </div>
        </Dialog>

        {/* Single Task Dialog */}
        <Dialog
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-blue-900">{selectedTask?.title}</h3>
              <button onClick={() => setTaskDialogOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  className="w-5 h-5 border-2 border-blue-900 rounded-full"
                  checked={selectedTask?.completed}
                  onChange={() => {
                    if (selectedTask) {
                      handleMarkCompleted(selectedTask.id)
                      setTaskDialogOpen(false)
                    }
                  }}
                />
                <span>Mark as completed</span>
              </div>

              {hasOtherLists && (
                <div className="space-y-2">
                  {availableLists.map(list => (
                    <button
                      key={list.id}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded ml-8"
                      onClick={() => {
                        if (selectedTask) {
                          handleMoveTask(selectedTask.id, list.id)
                          setTaskDialogOpen(false)
                        }
                      }}
                    >
                      Move to {list.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog>

        {/* List Options Dialog */}
        <Dialog
          open={listOptionsOpen}
          onClose={() => setListOptionsOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-blue-900">List Options</h3>
              <button onClick={() => setListOptionsOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 border-2 border-blue-900 rounded-full"
                    onChange={() => {
                      if (selectedListId && confirm('Are you sure you want to remove this list?')) {
                        handleRemoveList(selectedListId)
                        setListOptionsOpen(false)
                      }
                    }}
                  />
                  <span>Remove this list</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit size={16} className="text-blue-900" />
                    <span>Rename list</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="flex-1 border rounded px-2 py-1"
                      placeholder="Enter new name"
                    />
                    <button
                      className="bg-blue-900 text-white px-3 py-1 rounded"
                      onClick={() => handleRenameList(selectedListId, newListName)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>

        {/* Add List Button */}
        <button 
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg"
          onClick={handleAddList}
        >
          <Plus size={24} />
        </button>

        {/* Logout Dialog */}
        <Dialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Logout</h3>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setLogoutDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

