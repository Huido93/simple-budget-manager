import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import BudgetChart from './BudgetChart';
import axiosInstance from './../api/axiosInstance';

const BudgetModal = ({ show, onClose, initialBudget, expenditures, onUpdateBudget, onNewBudget }) => {
  const [budget, setBudget] = useState({
    name: '',
    totalAmount: '',
    description: '',
    categories: [],
  });

  const [categoryInput, setCategoryInput] = useState({
    categoryName: '',
    categoryAmount: '',
  });

  const [warning, setWarning] = useState('');

  // Load existing budget data when editing
  useEffect(() => {
    if (show && initialBudget) {
      setBudget({
        name: initialBudget.name,
        totalAmount: initialBudget.totalAmount,
        description: initialBudget.description,
        categories: initialBudget.categories.map((cat) => ({
          id: cat._id || Date.now(),
          name: cat.name,
          amount: cat.amount,
        })),
      });
    }
  }, [show, initialBudget]);

  // Calculate total allocated amount
  const totalAllocated = budget.categories.reduce((sum, cat) => sum + Number(cat.amount), 0);

  // Handle budget input changes
  const handleBudgetInputChange = (e) => {
    const { name, value } = e.target;
    setBudget({ ...budget, [name]: value });
    setWarning('');
  };

  // Handle category input changes
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryInput({ ...categoryInput, [name]: value });
  };

  // Add a new category
  const handleAddCategory = () => {
    if (!categoryInput.categoryName || !categoryInput.categoryAmount) {
      setWarning('📛 카테고리 이름과 금액을 입력하세요.');
      return;
    }

    const newTotal = totalAllocated + Number(categoryInput.categoryAmount);

    if (newTotal > budget.totalAmount) {
      setWarning('📛 카테고리 금액이 총 예산을 초과합니다.');
      return;
    }

    setWarning('');
    setBudget({
      ...budget,
      categories: [
        ...budget.categories,
        { id: Date.now(), name: categoryInput.categoryName, amount: categoryInput.categoryAmount },
      ],
    });

    setCategoryInput({ categoryName: '', categoryAmount: '' });
  };

  // Edit an existing category
  const handleEditCategory = (id, field, value) => {
    const updatedCategories = budget.categories.map((cat) =>
      cat.id === id ? { ...cat, [field]: value } : cat
    );

    setBudget({ ...budget, categories: updatedCategories });
  };

  // Delete a category
  const handleDeleteCategory = (id) => {
    const categoryToDelete = budget.categories.find((cat) => cat.id === id);
    const isCategoryUsed = expenditures.some((exp) => exp.category === categoryToDelete.name);
  
    if (isCategoryUsed) {
      setWarning(`📛 '${categoryToDelete.name}' 카테고리는 이미 지출 내역이 있어 삭제할 수 없습니다.`);
      return;
    }
  
    const updatedCategories = budget.categories.filter((cat) => cat.id !== id);
    setBudget({ ...budget, categories: updatedCategories });
  };

  // Handle form submission (Create or Update budget)
  const handleFormSubmit = async () => {
    if (totalAllocated > budget.totalAmount) {
      setWarning('📛 카테고리 금액이 총 예산을 초과합니다.');
      return;
    }

    setWarning('');

    try {
      let updatedBudget;
      if (initialBudget) {
        // Update existing budget
        const response = await axiosInstance.put(`/api/budgets/${initialBudget._id}`, budget);
        updatedBudget = response.data;
        if (onUpdateBudget) {
          onUpdateBudget(updatedBudget);
        }
      } else {
        // Create new budget
        const response = await axiosInstance.post('/api/budgets', budget);
        updatedBudget = response.data;
        if (onNewBudget) {
          onNewBudget(updatedBudget);
        }
      }

      onClose();
    } catch (error) {
      console.error('예산 저장 오류:', error.response?.data || error.message);
      setWarning('❌ 예산 저장 실패. 다시 시도해 주세요.');
    }
  };
  

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{initialBudget ? '예산 수정' : '새 예산 만들기'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {warning && <Alert variant="danger">{warning}</Alert>}
        <Form>
          {/* Budget Name and Total Amount */}
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formName">
                <Form.Label>📌 예산 이름</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="예산 이름 입력"
                  value={budget.name}
                  onChange={handleBudgetInputChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formTotalAmount">
                <Form.Label>💰 총 금액</Form.Label>
                <Form.Control
                  type="number"
                  name="totalAmount"
                  placeholder="총 금액 입력"
                  value={budget.totalAmount}
                  onChange={handleBudgetInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Budget Description */}
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>📝 설명</Form.Label>
            <Form.Control
              type="text"
              name="description"
              placeholder="예산 설명 입력"
              value={budget.description}
              onChange={handleBudgetInputChange}
            />
          </Form.Group>

          {/* Add Categories */}
          <h5>📂 카테고리 추가</h5>
          <Row className="mb-3">
            <Col>
              <Form.Control
                type="text"
                name="categoryName"
                placeholder="카테고리 이름"
                value={categoryInput.categoryName}
                onChange={handleCategoryInputChange}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                name="categoryAmount"
                placeholder="금액"
                value={categoryInput.categoryAmount}
                onChange={handleCategoryInputChange}
              />
            </Col>
            <Col>
              <Button variant="success" onClick={handleAddCategory}>
                ➕ 추가
              </Button>
            </Col>
          </Row>

          {/* List of Categories */}
          {budget.categories.length > 0 && (
            <div>
              {budget.categories.map((cat) => (
                <Row key={cat.id} className="mb-2">
                  <Col>
                    <Form.Control
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleEditCategory(cat.id, 'name', e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      value={cat.amount}
                      onChange={(e) => handleEditCategory(cat.id, 'amount', e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button variant="danger" onClick={() => handleDeleteCategory(cat.id)}>
                      🗑️ 삭제
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Form>

        {/* Doughnut Chart */}
        {budget.totalAmount > 0 && (
          <div style={{ maxWidth: '400px', margin: '20px auto' }}>
            <BudgetChart totalAmount={budget.totalAmount} categories={budget.categories} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          ❌ 취소
        </Button>
        <Button variant="primary" onClick={handleFormSubmit}>
          💾 저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BudgetModal;
