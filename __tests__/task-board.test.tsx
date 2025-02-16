import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TaskBoard } from '../components/dashboard/task-board'

// Mock the dependencies
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: '123', displayName: 'Test User' },
    logout: jest.fn()
  })
}))

jest.mock('../lib/web3', () => ({
  connectWallet: jest.fn().mockResolvedValue('0x123...456')
}))

describe('TaskBoard', () => {
  it('renders task board', () => {
    render(<TaskBoard />)
    expect(screen.getByText('TasksBoard')).toBeInTheDocument()
  })

  it('adds a new task', async () => {
    render(<TaskBoard />)
    
    // Click add task button
    fireEvent.click(screen.getByText('Add a task'))
    
    // Fill in task details
    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: 'New Test Task' }
    })
    
    // Save task
    fireEvent.click(screen.getByText('Save Task'))
    
    // Check if success message appears
    expect(await screen.findByText('Task added successfully')).toBeInTheDocument()
  })

  it('connects wallet', async () => {
    render(<TaskBoard />)
    
    // Click connect wallet button
    fireEvent.click(screen.getByText('Connect Wallet'))
    
    // Check if wallet address appears
    expect(await screen.findByText('0x123...456')).toBeInTheDocument()
  })
}) 